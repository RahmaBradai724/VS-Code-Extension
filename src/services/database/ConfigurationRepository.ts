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
import { NpduConfig } from '../../models/framework/NpduConfig';
import { SomeIPConfig } from '../../models/framework/SomeIPConfig';
import { AppLayerPortsConfig } from '../../models/framework/AppLayerPortsConfig';
import { EthernetTopology } from '../../models/framework/EthernetTopology';
import { ChannelEcuMapping } from '../../models/framework/ChannelEcuMapping';
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
          await chRepo.save(chRepo.create({ ...ch, configurationId: configId }));
        }
      }
    }

    if (parsedData.hardwareChannels) {
      for (const ch of parsedData.hardwareChannels) {
        const EntityClass = HARDWARE_MAP[ch.subclass];
        if (EntityClass) {
          const chRepo = ds.getRepository(EntityClass);
          await chRepo.save(chRepo.create({ ...ch, configurationId: configId }));
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

        // NPduConfig → dedicated table
        if (ec.npduConfig !== undefined) {
          if (!fwEntity.ethernetConfig.npduConfig) { fwEntity.ethernetConfig.npduConfig = new NpduConfig(); }
          const n = ec.npduConfig;
          fwEntity.ethernetConfig.npduConfig.manageVlansInCom          = n.ManageVlansInCom;
          fwEntity.ethernetConfig.npduConfig.restrictNPduChannelsInCom = n.RestrictNPduChannelsInCom;
          fwEntity.ethernetConfig.npduConfig.ipMacTable                = n.IPMacTable;
          fwEntity.ethernetConfig.npduConfig.vlans                     = n.VLans;
        }

        // SomeIPConfig → dedicated table
        if (ec.someIPConfig !== undefined) {
          if (!fwEntity.ethernetConfig.someIPConfig) { fwEntity.ethernetConfig.someIPConfig = new SomeIPConfig(); }
          const s = ec.someIPConfig;
          fwEntity.ethernetConfig.someIPConfig.serverToClientPortRangeMapping = s.ServerToClientPortRangeMapping;
          fwEntity.ethernetConfig.someIPConfig.endpointImplementation         = s.EndpointImplementation;
          fwEntity.ethernetConfig.someIPConfig.adapterName                    = s.AdapterName;
        }

        // AppLayerPorts → dedicated table
        if (ec.appLayerPorts !== undefined) {
          if (!fwEntity.ethernetConfig.appLayerPortsConfig) { fwEntity.ethernetConfig.appLayerPortsConfig = new AppLayerPortsConfig(); }
          const a = ec.appLayerPorts;
          fwEntity.ethernetConfig.appLayerPortsConfig.nPdu    = a.NPdu    != null ? Number(a.NPdu)    : undefined;
          fwEntity.ethernetConfig.appLayerPortsConfig.someIp  = a.SomeIp  != null ? Number(a.SomeIp)  : undefined;
          fwEntity.ethernetConfig.appLayerPortsConfig.udpNm   = a.UDPNM   != null ? Number(a.UDPNM)   : undefined;
          fwEntity.ethernetConfig.appLayerPortsConfig.dlt     = a.DLT     != null ? Number(a.DLT)     : undefined;
          fwEntity.ethernetConfig.appLayerPortsConfig.someIpSD = a.SomeIpSD != null ? Number(a.SomeIpSD) : undefined;
        }

        // EthernetTopology → dedicated table
        if (ec.ethernetTopology !== undefined) {
          if (!fwEntity.ethernetConfig.ethernetTopology) { fwEntity.ethernetConfig.ethernetTopology = new EthernetTopology(); }
          const t = ec.ethernetTopology;
          fwEntity.ethernetConfig.ethernetTopology.ethProtoPrioConfig = t.EthProtoPrioConfig;
          fwEntity.ethernetConfig.ethernetTopology.topologyConfig     = t.TopologyConfig;
        }

        // ChannelToEcusMapping → dedicated table (one row per channel)
        if (ec.channelToEcusMapping !== undefined) {
          fwEntity.ethernetConfig.channelEcuMappings = Object.entries(ec.channelToEcusMapping)
            .map(([channelName, ecus]) => {
              const m = new ChannelEcuMapping();
              m.channelName = channelName;
              m.ecus = Array.isArray(ecus) ? ecus as string[] : (typeof ecus === 'string' ? [ecus] : []);
              return m;
            });
        }
      }
      const savedFw = await fwRepo.save(fwEntity);
      // Link the saved FrameworkConfig back to the Configuration row
      await repo.update(configId, { frameworkConfig: savedFw } as any);

      // Backfill denormalised frameworkConfigId on all EthernetConfig sub-tables
      // (cascade saves the rows first, then we stamp the FK so it is never NULL)
      if (savedFw.ethernetConfig?.id) {
        const fwId  = savedFw.id;
        const ethId = savedFw.ethernetConfig.id;

        if (savedFw.ethernetConfig.npduConfig?.id) {
          await ds.getRepository(NpduConfig).update(
            savedFw.ethernetConfig.npduConfig.id, { frameworkConfigId: fwId });
        }
        if (savedFw.ethernetConfig.someIPConfig?.id) {
          await ds.getRepository(SomeIPConfig).update(
            savedFw.ethernetConfig.someIPConfig.id, { frameworkConfigId: fwId });
        }
        if (savedFw.ethernetConfig.appLayerPortsConfig?.id) {
          await ds.getRepository(AppLayerPortsConfig).update(
            savedFw.ethernetConfig.appLayerPortsConfig.id, { frameworkConfigId: fwId });
        }
        if (savedFw.ethernetConfig.ethernetTopology?.id) {
          await ds.getRepository(EthernetTopology).update(
            savedFw.ethernetConfig.ethernetTopology.id, { frameworkConfigId: fwId });
        }
        if (savedFw.ethernetConfig.channelEcuMappings?.length) {
          await ds.getRepository(ChannelEcuMapping)
            .createQueryBuilder()
            .update()
            .set({ frameworkConfigId: fwId })
            .where('"ethernetConfigId" = :ethId', { ethId })
            .execute();
        }
      }

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
        'frameworkConfig.ethernetConfig',
        'frameworkConfig.ethernetConfig.npduConfig',
        'frameworkConfig.ethernetConfig.someIPConfig',
        'frameworkConfig.ethernetConfig.appLayerPortsConfig',
        'frameworkConfig.ethernetConfig.ethernetTopology',
        'frameworkConfig.ethernetConfig.channelEcuMappings',
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
        'frameworkConfig.ethernetConfig',
        'frameworkConfig.ethernetConfig.npduConfig',
        'frameworkConfig.ethernetConfig.someIPConfig',
        'frameworkConfig.ethernetConfig.appLayerPortsConfig',
        'frameworkConfig.ethernetConfig.ethernetTopology',
        'frameworkConfig.ethernetConfig.channelEcuMappings',
        'frameworkConfig.pcapTracers',
        'frameworkConfig.asciiTracers',
      ],
    });
  }

  async deleteById(id: string): Promise<void> {
    await initializeDatabase();
    const ds  = getDataSource();
    const repo = ds.getRepository(Configuration);

    // Delete mappings (ManyToOne back-ref, no cascade on Configuration side)
    await ds.getRepository(Mapping)
      .createQueryBuilder()
      .delete()
      .where('"configurationId" = :id', { id })
      .execute();

    // Delete logical channels
    for (const EntityClass of Object.values(LOGICAL_MAP)) {
      await ds.getRepository(EntityClass)
        .createQueryBuilder()
        .delete()
        .where('"configurationId" = :id', { id })
        .execute();
    }

    // Delete hardware channels
    for (const EntityClass of Object.values(HARDWARE_MAP)) {
      await ds.getRepository(EntityClass)
        .createQueryBuilder()
        .delete()
        .where('"configurationId" = :id', { id })
        .execute();
    }

    // Load config with all relations so TypeORM cascade remove works
    const config = await repo.findOne({
      where: { id },
      relations: [
        'frameworkConfig',
        'frameworkConfig.publisherConfig',
        'frameworkConfig.ethernetConfig',
        'frameworkConfig.ethernetConfig.npduConfig',
        'frameworkConfig.ethernetConfig.someIPConfig',
        'frameworkConfig.ethernetConfig.appLayerPortsConfig',
        'frameworkConfig.ethernetConfig.ethernetTopology',
        'frameworkConfig.ethernetConfig.channelEcuMappings',
        'frameworkConfig.pcapTracers',
        'frameworkConfig.asciiTracers',
        'mappings',
      ],
    });

    if (config) {
      await repo.remove(config);
    }
  }
}
