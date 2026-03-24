import { Pool } from 'pg';
import * as vscode from 'vscode';

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '123',
    database: 'VS_Code_Extension',
    port: 5432,
});

let initializationPromise: Promise<void> | null = null;

/**
 * Initializes the database by creating necessary tables if they don't exist.
 */
export function initializeDatabase(): Promise<void> {
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
        } catch (err: any) {
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
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        client.release();
        return true;
    } catch (err) {
        console.error('Error connecting to the database:', err);
        vscode.window.showErrorMessage('Failed to connect to PostgreSQL.');
        return false;
    }
}

/**
 * Save configuration
 */
export async function saveConfigurationToDb(configId: string, name: string, userId: string, data: string) {
  const client = await pool.connect();
  try {
    const query = 'INSERT INTO configurations (config_id, name, user_id, config_data) VALUES ($1, $2, $3, $4) ON CONFLICT (config_id) DO UPDATE SET name = $2, user_id = $3, config_data = $4, updated_at = CURRENT_TIMESTAMP';
    const values = [configId, name, userId, data];
    await client.query(query, values);
    console.log(`Configuration ${name} saved to DB.`);
  } finally {
    client.release();
  }
}

/**
 * Save a user to the database and return the saved user object (including ID)
 */
export async function saveUserToDb(name: string, email: string): Promise<any> {
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
    } catch (err: any) {
        console.error('Error saving user:', err);
        vscode.window.showErrorMessage(`Failed to save user to database: ${err.message}`);
        throw err;
    }
}

/**
 * Get a user from the database
 */
export async function getUserById(id: number): Promise<any | null> {
    const query = 'SELECT * FROM users WHERE id = $1;';
    try {
        const res = await pool.query(query, [id]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error fetching user:', err);
        return null;
    }
}

/**
 * Find a user by name and email
 */
export async function findUserByNameAndEmail(name: string, email: string): Promise<any | null> {
    await initializeDatabase();
    const query = 'SELECT * FROM users WHERE name = $1 AND email = $2 LIMIT 1;';
    try {
        const res = await pool.query(query, [name, email]);
        return res.rows[0] || null;
    } catch (err) {
        console.error('Error finding user:', err);
        return null;
    }
}

export default pool;