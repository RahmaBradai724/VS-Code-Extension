import { DataSource } from 'typeorm';
import * as vscode from 'vscode';
import {
  FlexRayChannel,
  SerialChannel,
  CANChannel,
  IOInputChannel,
  IOOutputChannel,
  LINChannel,
  IOSerialChannel,
  BridgeChannel,
  EthernetChannel,
  PSChannel,
} from '../../models/logicalChannels';
import {
  LINCard,
  SerialPort,
  HIDRelay,
  RelayBoard,
  EthernetAdapter,
  AnalogDevice,
  CANInterface,
  CIBInterface,
  TEAnalog,
  CMInterface,
  HHLoad,
  BTSRevo,
} from '../../models/hardwareChannels';
import { Configuration } from '../../models/configuration';
import { User } from '../../models/user';
import { Mapping } from '../../models/mapping';
import { FrameworkConfig, PCAPTracer, ASCIITracer, EthernetConfig, PublisherConfig, DiagnosticsConfig } from '../../models/frameworkConfig';

// ── Database configuration ──────────────────────────────────────────────────
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'VS_Code_Extension',
  username: 'postgres',
  password: '123',
} as const;

// ── Singleton DataSource ────────────────────────────────────────────────────
let appDataSource: DataSource | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Returns the shared DataSource instance (creates it on first call).
 * Singleton pattern: one TypeORM DataSource per process.
 */
export function getDataSource(): DataSource {
  if (!appDataSource) {
    appDataSource = new DataSource({
      type: 'postgres',
      host: dbConfig.host,
      port: dbConfig.port,
      username: dbConfig.username,
      password: dbConfig.password,
      database: dbConfig.database,
      synchronize: true,
      logging: false,
      entities: [
        FlexRayChannel, SerialChannel, CANChannel, IOInputChannel, IOOutputChannel,
        LINChannel, IOSerialChannel, BridgeChannel, EthernetChannel, PSChannel,
        LINCard, SerialPort, HIDRelay, RelayBoard, EthernetAdapter, AnalogDevice,
        CANInterface, CIBInterface, TEAnalog, CMInterface, HHLoad, BTSRevo,
        PCAPTracer, ASCIITracer, FrameworkConfig,
        EthernetConfig, PublisherConfig, DiagnosticsConfig,
        Configuration, User, Mapping,
      ],
    });
  }
  return appDataSource;
}

/**
 * Initializes the DataSource exactly once (subsequent calls return the same promise).
 */
export function initializeDatabase(): Promise<void> {
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    try {
      const ds = getDataSource();
      if (!ds.isInitialized) {
        await ds.initialize();
      }
      console.log('Database initialized successfully (TypeORM).');
    } catch (err: any) {
      // Reset so the next call can retry with a fresh DataSource
      initializationPromise = null;
      appDataSource = null;
      console.error('Error initializing database:', err);
      vscode.window.showErrorMessage(
        `Failed to initialize database schema. ${err?.message || ''}`
      );
      throw err;
    }
  })();

  return initializationPromise;
}

export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await initializeDatabase();
    await getDataSource().query('SELECT 1');
    return true;
  } catch (err) {
    console.error('Error connecting to the database:', err);
    vscode.window.showErrorMessage('Failed to connect to PostgreSQL.');
    return false;
  }
}
