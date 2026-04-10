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
exports.getDataSource = getDataSource;
exports.initializeDatabase = initializeDatabase;
exports.testDatabaseConnection = testDatabaseConnection;
const typeorm_1 = require("typeorm");
const vscode = __importStar(require("vscode"));
const logicalChannels_1 = require("../../models/logicalChannels");
const hardwareChannels_1 = require("../../models/hardwareChannels");
const configuration_1 = require("../../models/configuration");
const user_1 = require("../../models/user");
const mapping_1 = require("../../models/mapping");
const frameworkConfig_1 = require("../../models/frameworkConfig");
// ── Database configuration ──────────────────────────────────────────────────
const dbConfig = {
    host: 'localhost',
    port: 5432,
    database: 'VS_Code_Extension',
    username: 'postgres',
    password: '123',
};
// ── Singleton DataSource ────────────────────────────────────────────────────
let appDataSource = null;
let initializationPromise = null;
/**
 * Returns the shared DataSource instance (creates it on first call).
 * Singleton pattern: one TypeORM DataSource per process.
 */
function getDataSource() {
    if (!appDataSource) {
        appDataSource = new typeorm_1.DataSource({
            type: 'postgres',
            host: dbConfig.host,
            port: dbConfig.port,
            username: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database,
            synchronize: false,
            logging: false,
            entities: [
                logicalChannels_1.FlexRayChannel, logicalChannels_1.SerialChannel, logicalChannels_1.CANChannel, logicalChannels_1.IOInputChannel, logicalChannels_1.IOOutputChannel,
                logicalChannels_1.LINChannel, logicalChannels_1.IOSerialChannel, logicalChannels_1.BridgeChannel, logicalChannels_1.EthernetChannel, logicalChannels_1.PSChannel,
                hardwareChannels_1.LINCard, hardwareChannels_1.SerialPort, hardwareChannels_1.HIDRelay, hardwareChannels_1.RelayBoard, hardwareChannels_1.EthernetAdapter, hardwareChannels_1.AnalogDevice,
                hardwareChannels_1.CANInterface, hardwareChannels_1.CIBInterface, hardwareChannels_1.TEAnalog, hardwareChannels_1.CMInterface, hardwareChannels_1.HHLoad, hardwareChannels_1.BTSRevo,
                frameworkConfig_1.PCAPTracer, frameworkConfig_1.ASCIITracer, frameworkConfig_1.FrameworkConfig,
                configuration_1.Configuration, user_1.User, mapping_1.Mapping,
            ],
        });
    }
    return appDataSource;
}
/**
 * Initializes the DataSource exactly once (subsequent calls return the same promise).
 */
function initializeDatabase() {
    if (initializationPromise) {
        return initializationPromise;
    }
    initializationPromise = (async () => {
        try {
            const ds = getDataSource();
            if (!ds.isInitialized) {
                await ds.initialize();
            }
            // Ensure tracer tables exist (safe: IF NOT EXISTS avoids conflicts on reload)
            await ds.query(`
        CREATE TABLE IF NOT EXISTS pcap_tracers (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          "frameworkConfigId" INTEGER,
          "loggingType" VARCHAR,
          "timestamp" VARCHAR,
          "loggerConfiguration" JSONB
        )
      `);
            await ds.query(`
        CREATE TABLE IF NOT EXISTS ascii_tracers (
          id SERIAL PRIMARY KEY,
          name VARCHAR NOT NULL,
          "frameworkConfigId" INTEGER,
          base VARCHAR,
          "internalEventLogged" BOOLEAN NOT NULL DEFAULT false,
          "timeStampSetting" VARCHAR,
          "timestamp" VARCHAR,
          "loggerConfiguration" JSONB
        )
      `);
            console.log('Database initialized successfully (TypeORM).');
        }
        catch (err) {
            console.error('Error initializing database:', err);
            vscode.window.showErrorMessage(`Failed to initialize database schema. ${err?.message || ''}`);
            throw err;
        }
    })();
    return initializationPromise;
}
async function testDatabaseConnection() {
    try {
        const ds = getDataSource();
        if (!ds.isInitialized) {
            await ds.initialize();
        }
        await ds.query('SELECT 1');
        return true;
    }
    catch (err) {
        console.error('Error connecting to the database:', err);
        vscode.window.showErrorMessage('Failed to connect to PostgreSQL.');
        return false;
    }
}
//# sourceMappingURL=DataSourceProvider.js.map