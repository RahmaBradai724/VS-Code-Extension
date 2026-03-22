"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDatabase = initializeDatabase;
exports.testDatabaseConnection = testDatabaseConnection;
exports.saveConfigurationToDb = saveConfigurationToDb;
exports.saveUserToDb = saveUserToDb;
exports.getUserById = getUserById;
exports.findUserByNameAndEmail = findUserByNameAndEmail;
const pg_1 = require("pg");
const vscode = __importStar(require("vscode"));
const pool = new pg_1.Pool({
    host: 'localhost',
    user: 'postgres',
    password: '123',
    database: 'VS_Code_Extension',
    port: 5432,
});
let initializationPromise = null;
/**
 * Initializes the database by creating necessary tables if they don't exist.
 */
function initializeDatabase() {
    if (initializationPromise) {
        return initializationPromise;
    }
    initializationPromise = (async () => {
        const createTablesQuery = `
            CREATE TABLE IF NOT EXISTS configurations (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                data JSONB,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL
            );

            CREATE UNIQUE INDEX IF NOT EXISTS users_name_email_uq ON users (name, email);

            -- Repair legacy / TypeORM tables where id is NOT NULL but has no DEFAULT
            DO $migrate$
            DECLARE
                col_type text;
                seq_name text;
                max_id bigint;
            BEGIN
                SELECT c.data_type INTO col_type
                FROM information_schema.columns c
                WHERE c.table_schema = 'public' AND c.table_name = 'users' AND c.column_name = 'id';

                IF col_type IS NULL THEN
                    RETURN;
                END IF;

                seq_name := pg_get_serial_sequence('public.users', 'id');

                IF col_type IN ('integer', 'bigint', 'smallint') THEN
                    IF seq_name IS NULL THEN
                        CREATE SEQUENCE IF NOT EXISTS users_id_seq;
                        SELECT COALESCE(MAX(id), 0) INTO max_id FROM users;
                        PERFORM setval('users_id_seq', max_id);
                        ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);
                        ALTER SEQUENCE users_id_seq OWNED BY users.id;
                    ELSE
                        EXECUTE format(
                            'ALTER TABLE users ALTER COLUMN id SET DEFAULT nextval(%L::regclass)',
                            seq_name
                        );
                    END IF;
                ELSIF col_type IN ('character varying', 'text') THEN
                    ALTER TABLE users ALTER COLUMN id SET DEFAULT (gen_random_uuid()::text);
                ELSIF col_type = 'uuid' THEN
                    ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
                END IF;
            END
            $migrate$;
        `;
        try {
            await pool.query(createTablesQuery);
            console.log('Database initialized successfully.');
        }
        catch (err) {
            console.error('Error initializing database tables:', err);
            const detail = err?.message ? ` ${err.message}` : '';
            vscode.window.showErrorMessage(`Failed to initialize database schema.${detail}`);
            throw err;
        }
    })();
    return initializationPromise;
}
/**
 * Tests the connection to the PostgreSQL database.
 */
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    }
    catch (err) {
        console.error('Error connecting to the database:', err);
        vscode.window.showErrorMessage('Failed to connect to PostgreSQL.');
        return false;
    }
}
/**
 * Save configuration
 */
async function saveConfigurationToDb(configName, configData) {
    await initializeDatabase();
    const query = `
        INSERT INTO configurations (name, data, created_at)
        VALUES ($1, $2, NOW())
        RETURNING id;
    `;
    const values = [configName, configData];
    try {
        const res = await pool.query(query, values);
        console.log('Saved configuration with ID:', res.rows[0].id);
    }
    catch (err) {
        console.error('Error executing query', err);
        vscode.window.showErrorMessage(`Failed to save configuration: ${err.message}`);
    }
}
/**
 * Save a user to the database and return the saved user object (including ID)
 */
async function saveUserToDb(name, email) {
    await initializeDatabase();
    const query = `
        INSERT INTO users (name, email)
        VALUES ($1, $2)
        ON CONFLICT (name, email) DO UPDATE 
        SET name = EXCLUDED.name, email = EXCLUDED.email
        RETURNING *;
    `;
    const values = [name, email];
    try {
        const res = await pool.query(query, values);
        console.log('User saved:', res.rows[0].id);
        return res.rows[0];
    }
    catch (err) {
        console.error('Error saving user:', err);
        vscode.window.showErrorMessage(`Failed to save user to database: ${err.message}`);
        throw err;
    }
}
/**
 * Get a user from the database
 */
async function getUserById(id) {
    const query = 'SELECT * FROM users WHERE id = $1;';
    try {
        const res = await pool.query(query, [id]);
        return res.rows[0] || null;
    }
    catch (err) {
        console.error('Error fetching user:', err);
        return null;
    }
}
/**
 * Find a user by name and email
 */
async function findUserByNameAndEmail(name, email) {
    await initializeDatabase();
    const query = 'SELECT * FROM users WHERE name = $1 AND email = $2 LIMIT 1;';
    try {
        const res = await pool.query(query, [name, email]);
        return res.rows[0] || null;
    }
    catch (err) {
        console.error('Error finding user:', err);
        return null;
    }
}
exports.default = pool;
//# sourceMappingURL=databaseService.js.map