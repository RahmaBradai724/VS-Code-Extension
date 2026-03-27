import { DataSource } from 'typeorm';
import * as vscode from 'vscode';
import {
  FlexRayChannel,
  SerialChannel,
  CANChannel,
  IOInputChannel,
  IOOutputChannel,
  LINChannel,
  IPSChannel,
  BridgeChannel,
  AnalogChannel,
  EthernetChannel,
  PSChannel,
} from '../models/logicalChannels';
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
} from '../models/hardwareChannels';
import { Configuration } from '../models/configuration';
import { User } from '../models/user';
import { Mapping } from '../models/mapping';
import { FrameworkConfig, PCAPTracer, ASCIITracer, Tracer } from '../models/frameworkConfig';

// ── Database configuration ──────────────────────────────────────────────────
const dbConfig = {
  host: 'localhost',
  port: 5432,
  database: 'VS_Code_Extension',
  username: 'postgres',
  password: '123',
} as const;

// ── DataSource ──────────────────────────────────────────────────────────────
let appDataSource: DataSource | null = null;
let initializationPromise: Promise<void> | null = null;

function createDataSource(): DataSource {
  return new DataSource({
    type: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.database,
    synchronize: true,
    logging: false,
    entities: [
      FlexRayChannel,
      SerialChannel,
      CANChannel,
      IOInputChannel,
      IOOutputChannel,
      LINChannel,
      IPSChannel,
      BridgeChannel,
      AnalogChannel,
      EthernetChannel,
      PSChannel,
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
      Tracer,
      PCAPTracer,
      ASCIITracer,
      FrameworkConfig,
      Configuration,
      User,
      Mapping,
    ],
  });
}

export function getDataSource(): DataSource {
  if (!appDataSource) {
    appDataSource = createDataSource();
  }
  return appDataSource;
}

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
    const ds = getDataSource();
    if (!ds.isInitialized) {
      await ds.initialize();
    }
    await ds.query('SELECT 1');
    return true;
  } catch (err) {
    console.error('Error connecting to the database:', err);
    vscode.window.showErrorMessage('Failed to connect to PostgreSQL.');
    return false;
  }
}

// ── USER ─────────────────────────────────────────────────────────

export async function saveUserToDb(name: string, email: string): Promise<User> {
  await initializeDatabase();
  const repo = getDataSource().getRepository(User);

  let user = await repo.findOneBy({ name, email });
  if (user) return user;

  user = new User(name, email);
  return repo.save(user);
}

export async function getUserById(id: number): Promise<User | null> {
  await initializeDatabase();
  return getDataSource().getRepository(User).findOneBy({ id });
}

export async function findUserByNameAndEmail(
  name: string,
  email: string
): Promise<User | null> {
  await initializeDatabase();
  return getDataSource().getRepository(User).findOneBy({ name, email });
}

// ── CONFIGURATION (FIXED) ─────────────────────────────────────────

export async function saveConfigurationToDb(
  configId: string,
  name: string,
  userId: string | number | null, // ✅ FIX HERE
  data: string
): Promise<void> {
  await initializeDatabase();
  const repo = getDataSource().getRepository(Configuration);

  // ✅ SAFE CONVERSION
  const safeUserId: number | null =
    userId !== null && userId !== undefined && userId !== ''
      ? Number(userId)
      : null;

  let config = await repo.findOneBy({ id: configId });

  if (config) {
    config.name = name;
    config.userId = safeUserId;
    config.data = data;
    config.touch();
  } else {
    config = new Configuration(configId, name, safeUserId);
    config.data = data;
  }

  await repo.save(config);
  
  // Persist individual channels (extract from JSON data)
  const parsedData = JSON.parse(data);
  const ds = getDataSource();

  // Helper map from subclass string to Entity class
  const logicalMap: Record<string, any> = {
    'FlexRayChannel': FlexRayChannel,
    'SerialChannel': SerialChannel,
    'CANChannel': CANChannel,
    'IOInputChannel': IOInputChannel,
    'IOOutputChannel': IOOutputChannel,
    'LINChannel': LINChannel,
    'IOSerialChannel': IPSChannel,
    'BridgeChannel': BridgeChannel,
    'AnalogChannel': AnalogChannel,
    'EthernetChannel': EthernetChannel,
    'PSChannel': PSChannel
  };

  const hardwareMap: Record<string, any> = {
    'LINCard': LINCard,
    'SerialPort': SerialPort,
    'HIDRelay': HIDRelay,
    'RelayBoard': RelayBoard,
    'EthernetAdapter': EthernetAdapter,
    'AnalogDevice': AnalogDevice,
    'TEAnalog': TEAnalog,
    'CANInterface': CANInterface,
    'CIBInterface': CIBInterface,
    'CMInterface': CMInterface,
    'HHLoad': HHLoad
  };

  if (parsedData.logicalChannels) {
    for (const ch of parsedData.logicalChannels) {
      const EntityClass = logicalMap[ch.subclass];
      if (EntityClass) {
        const chRepo = ds.getRepository(EntityClass);
        await chRepo.save(chRepo.create(ch));
      }
    }
  }

  if (parsedData.hardwareChannels) {
    for (const ch of parsedData.hardwareChannels) {
      const EntityClass = hardwareMap[ch.subclass];
      if (EntityClass) {
        const chRepo = ds.getRepository(EntityClass);
        await chRepo.save(chRepo.create(ch));
      }
    }
  }

  console.log(`Configuration ${name} saved to DB.`);
}