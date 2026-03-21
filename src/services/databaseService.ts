import { Pool } from 'pg';
import * as vscode from 'vscode';

// We create a single Pool instance to manage our database connections.
// You will need to replace the connection string below with your actual PostgreSQL URL
// (e.g., postgres://username:password@localhost:5432/my_database)
const pool = new Pool({
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
export async function testDatabaseConnection(): Promise<boolean> {
    try {
        const client = await pool.connect();
        vscode.window.showInformationMessage('Successfully connected to the PostgreSQL Database!');
        client.release();
        return true;
    } catch (err) {
        console.error('Error connecting to the database:', err);
        vscode.window.showErrorMessage('Failed to connect to the PostgreSQL Database. Check the connection string.');
        return false;
    }
}

/**
 * Example function to save a configuration model to the database
 */
export async function saveConfigurationToDb(configName: string, configData: string): Promise<void> {
    const query = `
        INSERT INTO configurations (name, data, created_at)
        VALUES ($1, $2, NOW())
        RETURNING id;
    `;
    const values = [configName, configData];

    try {
        const res = await pool.query(query, values);
        console.log('Saved configuration with ID:', res.rows[0].id);
    } catch (err) {
        console.error('Error executing query', err);
        vscode.window.showErrorMessage('Failed to save configuration to the database.');
    }
}

export default pool;
