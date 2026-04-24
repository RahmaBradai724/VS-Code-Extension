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
import { FrameworkConfig, EthernetConfig, PublisherConfig } from '../../models/framework';
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
        relations: [
          'frameworkConfig',
          'frameworkConfig.publisherConfig',
          'frameworkConfig.diagnostics',
          'frameworkConfig.ethernetConfig',
        ],
      });
      const fwEntity = existingWithFw?.frameworkConfig ?? new FrameworkConfig();
      const fw = parsedData.frameworkConfig;
      fwEntity.connectedEcus = fw.connectedEcus  ?? [];
      if (fw.servicePack !== undefined) { fwEntity.servicePack = fw.servicePack; }
      if (fw.publisherType || fw.channelsGroups) {
        if (!fwEntity.publisherConfig) { fwEntity.publisherConfig = new PublisherConfig(); }
        if (fw.publisherType)  { fwEntity.publisherConfig.publisherType  = fw.publisherType; }
        if (fw.channelsGroups) { fwEntity.publisherConfig.channelsGroups = fw.channelsGroups; }
      }
      if (fw.ethernetConfig) {
        const ec = fw.ethernetConfig;
        if (!fwEntity.ethernetConfig) { fwEntity.ethernetConfig = new EthernetConfig(); }
        if (ec.considerOnlyEthernetTopologyEcus !== undefined)
          fwEntity.ethernetConfig.considerOnlyEthernetTopologyEcus = ec.considerOnlyEthernetTopologyEcus;
        if (ec.npduConfig !== undefined)      fwEntity.ethernetConfig.npduConfig      = ec.npduConfig;
        if (ec.someIPConfig !== undefined)    fwEntity.ethernetConfig.someIPConfig    = ec.someIPConfig;
        if (ec.appLayerPorts !== undefined)   fwEntity.ethernetConfig.appLayerPorts   = ec.appLayerPorts;
        if (ec.ethernetTopology !== undefined) fwEntity.ethernetConfig.ethernetTopology = ec.ethernetTopology;
        if (ec.channelToEcusMapping !== undefined) fwEntity.channelToEcusMapping = ec.channelToEcusMapping;
      }
      const savedFw = await fwRepo.save(fwEntity);
      // Link the saved FrameworkConfig back to the Configuration row
      await repo.update(configId, { frameworkConfig: savedFw } as any);

      // Save tracers to their dedicated tables (pcap_tracers / ascii_tracers)
      const tracers: any[] = fw.tracers ?? [];
      const pcapRepo  = ds.getRepository(PCAPTracer);
      const asciiRepo = ds.getRepository(ASCIITracer);

      // Remove stale tracer rows for this frameworkConfig before reinserting
      await pcapRepo.createQueryBuilder().delete().where('"frameworkConfigId" = :id', { id: savedFw.id }).execute();
      await asciiRepo.createQueryBuilder().delete().where('"frameworkConfigId" = :id', { id: savedFw.id }).execute();

      for (const t of tracers) {
        if (t.Type === 'PCAP') {
          await pcapRepo.save(pcapRepo.create({
            name:                t.name,
            frameworkConfig:     savedFw,
            loggingType:         t.LoggingType,
            timestamp:           t.Timestamp,
            loggerConfiguration: t.LoggerConfiguration,
          }));
        } else if (t.Type === 'ASCII') {
          await asciiRepo.save(asciiRepo.create({
            name:                t.name,
            frameworkConfig:     savedFw,
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

  async findById(configId: string): Promise<Configuration | null> {
    await initializeDatabase();
    return getDataSource().getRepository(Configuration).findOne({
      where: { id: configId },
      relations: [
        'frameworkConfig',
        'frameworkConfig.publisherConfig',
        'frameworkConfig.diagnostics',
        'frameworkConfig.ethernetConfig',
        'frameworkConfig.pcapTracers',
        'frameworkConfig.asciiTracers',
        'mappings',
      ],
    });
  }

  async findAll(): Promise<Configuration[]> {
    await initializeDatabase();
    return getDataSource().getRepository(Configuration).find({
      relations: [
        'frameworkConfig',
        'frameworkConfig.publisherConfig',
        'frameworkConfig.diagnostics',
        'frameworkConfig.ethernetConfig',
        'frameworkConfig.pcapTracers',
        'frameworkConfig.asciiTracers',
      ],
    });
  }
}
