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
} from '../../models/hardwareChannels';
import { Configuration } from '../../models/configuration';
import { Mapping } from '../../models/mapping';
import { FrameworkConfig } from '../../models/framework';
import { PCAPTracer } from '../../models/framework/PCAPTracer';
import { ASCIITracer } from '../../models/framework/ASCIITracer';
import { getDataSource, initializeDatabase } from './DataSourceProvider';

const LOGICAL_MAP: Record<string, any> = {
  'FlexRayChannel': FlexRayChannel,
  'SerialChannel': SerialChannel,
  'CANChannel': CANChannel,
  'IOInputChannel': IOInputChannel,
  'IOOutputChannel': IOOutputChannel,
  'LINChannel': LINChannel,
  'IOSerialChannel': IOSerialChannel,
  'BridgeChannel': BridgeChannel,
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

    if (parsedData.mappings) {
      const mappingRepo = ds.getRepository(Mapping);
      for (const m of parsedData.mappings) {
        await mappingRepo.save(mappingRepo.create(m));
      }
    }

    if (parsedData.frameworkConfig) {
      const fwRepo = ds.getRepository(FrameworkConfig);
      const existingWithFw = await repo.findOne({
        where: { id: configId },
        relations: ['frameworkConfig'],
      });
      const fwEntity = existingWithFw?.frameworkConfig ?? new FrameworkConfig();
      const fw = parsedData.frameworkConfig;
      fwEntity.tracers       = fw.tracers        ?? [];
      fwEntity.connectedEcus = fw.connectedEcus  ?? [];
      if (fw.servicePack !== undefined) { fwEntity.servicePack = fw.servicePack; }
      if (fw.publisherType)    { fwEntity.publisherConfig.publisherType    = fw.publisherType; }
      if (fw.channelsGroups)   { fwEntity.publisherConfig.channelsGroups   = fw.channelsGroups; }
      const savedFw = await fwRepo.save(fwEntity);
      // Link the saved FrameworkConfig back to the Configuration row
      await repo.update(configId, { frameworkConfig: savedFw } as any);

      // Save tracers to their dedicated tables (pcap_tracers / ascii_tracers)
      const tracers: any[] = fw.tracers ?? [];
      const pcapRepo  = ds.getRepository(PCAPTracer);
      const asciiRepo = ds.getRepository(ASCIITracer);

      // Remove stale rows for this frameworkConfig before reinserting
      await pcapRepo.delete({ frameworkConfigId: savedFw.id });
      await asciiRepo.delete({ frameworkConfigId: savedFw.id });

      for (const t of tracers) {
        if (t.Type === 'PCAP') {
          await pcapRepo.save(pcapRepo.create({
            name:                t.name,
            frameworkConfigId:   savedFw.id,
            loggingType:         t.LoggingType,
            timestamp:           t.Timestamp,
            loggerConfiguration: t.LoggerConfiguration,
          }));
        } else if (t.Type === 'ASCII') {
          await asciiRepo.save(asciiRepo.create({
            name:                t.name,
            frameworkConfigId:   savedFw.id,
            base:                t.Base,
            internalEventLogged: t.InternalEventLogged ?? false,
            timeStampSetting:    t.TimeStampSetting,
            timestamp:           t.Timestamp,
            loggerConfiguration: t.LoggerConfiguration,
          }));
        }
      }
    }

    console.log(`Configuration ${name} saved to DB.`);
  }
}
