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
exports.testDatabaseConnection = testDatabaseConnection;
exports.saveConfigurationToDb = saveConfigurationToDb;
const pg_1 = require("pg");
const vscode = __importStar(require("vscode"));
// We create a single Pool instance to manage our database connections.
// You will need to replace the connection string below with your actual PostgreSQL URL
// (e.g., postgres://username:password@localhost:5432/my_database)
const pool = new pg_1.Pool({
    connectionString: 'postgres://username:password@localhost:5432/your_database_name',
    // Alternatively, you can configure it like this:
    // host: 'localhost',
    // user: 'postgres',
    // password: 'your_password',
    // database: 'your_database_name',
    // port: 5432,
});
/**
 * Tests the connection to the PostgreSQL database.
 */
async function testDatabaseConnection() {
    try {
        const client = await pool.connect();
        vscode.window.showInformationMessage('Successfully connected to the PostgreSQL Database!');
        client.release();
        return true;
    }
    catch (err) {
        console.error('Error connecting to the database:', err);
        vscode.window.showErrorMessage('Failed to connect to the PostgreSQL Database. Check the connection string.');
        return false;
    }
}
/**
 * Example function to save a configuration model to the database
 */
async function saveConfigurationToDb(configName, configData) {
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
        vscode.window.showErrorMessage('Failed to save configuration to the database.');
    }
}
exports.default = pool;
//# sourceMappingURL=databaseService.js.map