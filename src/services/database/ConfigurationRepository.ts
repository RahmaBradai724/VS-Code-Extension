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
} from '../../models/hardwareChannels';
import { Configuration } from '../../models/configuration';
import { getDataSource, initializeDatabase } from './DataSourceProvider';

const LOGICAL_MAP: Record<string, any> = {
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
  'PSChannel': PSChannel,
};

const HARDWARE_MAP: Record<string, any> = {
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
  'HHLoad': HHLoad,
};

/**
 * ConfigurationRepository encapsulates all Configuration-related database operations.
 * Repository pattern: isolates data access from generation and import logic.
 * SRP: Configuration persistence only.
 */
export class ConfigurationRepository {
  async save(
    configId: string,
    name: string,
    userId: string | number | null,
    data: string,
  ): Promise<void> {
    await initializeDatabase();
    const repo = getDataSource().getRepository(Configuration);

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

    const parsedData = JSON.parse(data);
    const ds = getDataSource();

    if (parsedData.logicalChannels) {
      for (const ch of parsedData.logicalChannels) {
        const EntityClass = LOGICAL_MAP[ch.subclass];
        if (EntityClass) {
          const chRepo = ds.getRepository(EntityClass);
          await chRepo.save(chRepo.create(ch));
        }
      }
    }

    if (parsedData.hardwareChannels) {
      for (const ch of parsedData.hardwareChannels) {
        const EntityClass = HARDWARE_MAP[ch.subclass];
        if (EntityClass) {
          const chRepo = ds.getRepository(EntityClass);
          await chRepo.save(chRepo.create(ch));
        }
      }
    }

    console.log(`Configuration ${name} saved to DB.`);
  }
}
