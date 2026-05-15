"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationRepository = void 0;
const logicalChannels_1 = require("../../models/logicalChannels");
const hardwareChannels_1 = require("../../models/hardwareChannels");
const configuration_1 = require("../../models/configuration");
const mapping_1 = require("../../models/mapping");
const framework_1 = require("../../models/framework");
const NpduConfig_1 = require("../../models/framework/NpduConfig");
const SomeIPConfig_1 = require("../../models/framework/SomeIPConfig");
const AppLayerPortsConfig_1 = require("../../models/framework/AppLayerPortsConfig");
const EthernetTopology_1 = require("../../models/framework/EthernetTopology");
const ChannelEcuMapping_1 = require("../../models/framework/ChannelEcuMapping");
const PCAPTracer_1 = require("../../models/framework/PCAPTracer");
const ASCIITracer_1 = require("../../models/framework/ASCIITracer");
const DataSourceProvider_1 = require("./DataSourceProvider");
/** Converts a raw AppLayerPorts value into a PortEntry array.
 *  Accepts: undefined | number | number[] | (number | number[])[] */
function normalisePortList(val) {
    if (val == null) {
        return undefined;
    }
    if (Array.isArray(val)) {
        return val;
    }
    if (typeof val === 'number') {
        return [val];
    }
    return undefined;
}
const LOGICAL_MAP = {
    'FlexRayChannel': logicalChannels_1.FlexRayChannel,
    'SerialChannel': logicalChannels_1.SerialChannel,
    'CANChannel': logicalChannels_1.CANChannel,
    'IOInputChannel': logicalChannels_1.IOInputChannel,
    'IOOutputChannel': logicalChannels_1.IOOutputChannel,
    'LINChannel': logicalChannels_1.LINChannel,
    'IOSerialChannel': logicalChannels_1.IOSerialChannel,
    'BridgeChannel': logicalChannels_1.BridgeChannel,
    'EthernetChannel': logicalChannels_1.EthernetChannel,
    'PSChannel': logicalChannels_1.PSChannel,
};
const HARDWARE_MAP = {
    'LINCard': hardwareChannels_1.LINCard,
    'SerialPort': hardwareChannels_1.SerialPort,
    'HIDRelay': hardwareChannels_1.HIDRelay,
    'RelayBoard': hardwareChannels_1.RelayBoard,
    'EthernetAdapter': hardwareChannels_1.EthernetAdapter,
    'AnalogDevice': hardwareChannels_1.AnalogDevice,
    'TEAnalog': hardwareChannels_1.TEAnalog,
    'CANInterface': hardwareChannels_1.CANInterface,
    'CIBInterface': hardwareChannels_1.CIBInterface,
    'CMInterface': hardwareChannels_1.CMInterface,
    'HHLoad': hardwareChannels_1.HHLoad,
};
/**
 * ConfigurationRepository encapsulates all Configuration-related database operations.
 * Repository pattern: isolates data access from generation and import logic.
 * SRP: Configuration persistence only.
 */
class ConfigurationRepository {
    async save(configId, name, userId, data) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        const repo = (0, DataSourceProvider_1.getDataSource)().getRepository(configuration_1.Configuration);
        const safeUserId = userId !== null && userId !== undefined && userId !== ''
            ? Number(userId)
            : null;
        let config = await repo.findOneBy({ id: configId });
        if (config) {
            config.name = name;
            config.userId = safeUserId;
            config.data = data;
            config.touch();
        }
        else {
            config = new configuration_1.Configuration(configId, name, safeUserId);
            config.data = data;
        }
        await repo.save(config);
        const parsedData = JSON.parse(data);
        const ds = (0, DataSourceProvider_1.getDataSource)();
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
            const mappingRepo = ds.getRepository(mapping_1.Mapping);
            for (const m of parsedData.mappings) {
                await mappingRepo.save(mappingRepo.create(m));
            }
        }
        if (parsedData.frameworkConfig) {
            const fwRepo = ds.getRepository(framework_1.FrameworkConfig);
            const existingWithFw = await repo.findOne({
                where: { id: configId },
                relations: [
                    'frameworkConfig',
                    'frameworkConfig.publisherConfig',
                    'frameworkConfig.ethernetConfig',
                ],
            });
            const fwEntity = existingWithFw?.frameworkConfig ?? new framework_1.FrameworkConfig();
            const fw = parsedData.frameworkConfig;
            fwEntity.connectedEcus = fw.connectedEcus ?? [];
            if (fw.servicePack !== undefined) {
                fwEntity.servicePack = fw.servicePack;
            }
            if (fw.publisherType || fw.channelsGroups) {
                if (!fwEntity.publisherConfig) {
                    fwEntity.publisherConfig = new framework_1.PublisherConfig();
                }
                if (fw.publisherType) {
                    fwEntity.publisherConfig.publisherType = fw.publisherType;
                }
                if (fw.channelsGroups) {
                    fwEntity.publisherConfig.channelsGroups = fw.channelsGroups;
                }
            }
            if (fw.ethernetConfig) {
                const ec = fw.ethernetConfig;
                if (!fwEntity.ethernetConfig) {
                    fwEntity.ethernetConfig = new framework_1.EthernetConfig();
                }
                if (ec.considerOnlyEthernetTopologyEcus !== undefined)
                    fwEntity.ethernetConfig.considerOnlyEthernetTopologyEcus = ec.considerOnlyEthernetTopologyEcus;
                // NPduConfig → dedicated table
                if (ec.npduConfig !== undefined) {
                    if (!fwEntity.ethernetConfig.npduConfig) {
                        fwEntity.ethernetConfig.npduConfig = new NpduConfig_1.NpduConfig();
                    }
                    const n = ec.npduConfig;
                    fwEntity.ethernetConfig.npduConfig.manageVlansInCom = n.ManageVlansInCom;
                    fwEntity.ethernetConfig.npduConfig.restrictNPduChannelsInCom = n.RestrictNPduChannelsInCom;
                    fwEntity.ethernetConfig.npduConfig.ipMacTable = n.IPMacTable;
                    fwEntity.ethernetConfig.npduConfig.vlans = n.VLans;
                }
                // SomeIPConfig → dedicated table
                if (ec.someIPConfig !== undefined) {
                    if (!fwEntity.ethernetConfig.someIPConfig) {
                        fwEntity.ethernetConfig.someIPConfig = new SomeIPConfig_1.SomeIPConfig();
                    }
                    const s = ec.someIPConfig;
                    fwEntity.ethernetConfig.someIPConfig.serverToClientPortRangeMapping = s.ServerToClientPortRangeMapping;
                    fwEntity.ethernetConfig.someIPConfig.endpointImplementation = s.EndpointImplementation;
                    fwEntity.ethernetConfig.someIPConfig.adapterName = s.AdapterName;
                }
                // AppLayerPorts → dedicated table
                if (ec.appLayerPorts !== undefined) {
                    if (!fwEntity.ethernetConfig.appLayerPortsConfig) {
                        fwEntity.ethernetConfig.appLayerPortsConfig = new AppLayerPortsConfig_1.AppLayerPortsConfig();
                    }
                    const a = ec.appLayerPorts;
                    fwEntity.ethernetConfig.appLayerPortsConfig.nPdu = normalisePortList(a.NPdu);
                    fwEntity.ethernetConfig.appLayerPortsConfig.someIp = normalisePortList(a.SomeIp);
                    fwEntity.ethernetConfig.appLayerPortsConfig.udpNm = normalisePortList(a.UDPNM);
                    fwEntity.ethernetConfig.appLayerPortsConfig.dlt = normalisePortList(a.DLT);
                    fwEntity.ethernetConfig.appLayerPortsConfig.someIpSD = normalisePortList(a.SomeIpSD);
                }
                // EthernetTopology → dedicated table
                if (ec.ethernetTopology !== undefined) {
                    if (!fwEntity.ethernetConfig.ethernetTopology) {
                        fwEntity.ethernetConfig.ethernetTopology = new EthernetTopology_1.EthernetTopology();
                    }
                    const t = ec.ethernetTopology;
                    fwEntity.ethernetConfig.ethernetTopology.ethProtoPrioConfig = t.EthProtoPrioConfig;
                    fwEntity.ethernetConfig.ethernetTopology.topologyConfig = t.TopologyConfig;
                }
                // ChannelToEcusMapping → dedicated table (one row per channel)
                if (ec.channelToEcusMapping !== undefined) {
                    fwEntity.ethernetConfig.channelEcuMappings = Object.entries(ec.channelToEcusMapping)
                        .map(([channelName, ecus]) => {
                        const m = new ChannelEcuMapping_1.ChannelEcuMapping();
                        m.channelName = channelName;
                        m.ecus = Array.isArray(ecus) ? ecus : (typeof ecus === 'string' ? [ecus] : []);
                        return m;
                    });
                }
            }
            const savedFw = await fwRepo.save(fwEntity);
            // Link the saved FrameworkConfig back to the Configuration row
            await repo.update(configId, { frameworkConfig: savedFw });
            // Backfill denormalised frameworkConfigId on all EthernetConfig sub-tables
            // (cascade saves the rows first, then we stamp the FK so it is never NULL)
            if (savedFw.ethernetConfig?.id) {
                const fwId = savedFw.id;
                const ethId = savedFw.ethernetConfig.id;
                if (savedFw.ethernetConfig.npduConfig?.id) {
                    await ds.getRepository(NpduConfig_1.NpduConfig).update(savedFw.ethernetConfig.npduConfig.id, { frameworkConfigId: fwId });
                }
                if (savedFw.ethernetConfig.someIPConfig?.id) {
                    await ds.getRepository(SomeIPConfig_1.SomeIPConfig).update(savedFw.ethernetConfig.someIPConfig.id, { frameworkConfigId: fwId });
                }
                if (savedFw.ethernetConfig.appLayerPortsConfig?.id) {
                    await ds.getRepository(AppLayerPortsConfig_1.AppLayerPortsConfig).update(savedFw.ethernetConfig.appLayerPortsConfig.id, { frameworkConfigId: fwId });
                }
                if (savedFw.ethernetConfig.ethernetTopology?.id) {
                    await ds.getRepository(EthernetTopology_1.EthernetTopology).update(savedFw.ethernetConfig.ethernetTopology.id, { frameworkConfigId: fwId });
                }
                if (savedFw.ethernetConfig.channelEcuMappings?.length) {
                    await ds.getRepository(ChannelEcuMapping_1.ChannelEcuMapping)
                        .createQueryBuilder()
                        .update()
                        .set({ frameworkConfigId: fwId })
                        .where('"ethernetConfigId" = :ethId', { ethId })
                        .execute();
                }
            }
            // Save tracers to their dedicated tables (pcap_tracers / ascii_tracers)
            const tracers = fw.tracers ?? [];
            const pcapRepo = ds.getRepository(PCAPTracer_1.PCAPTracer);
            const asciiRepo = ds.getRepository(ASCIITracer_1.ASCIITracer);
            // Remove stale tracer rows for this frameworkConfig before reinserting
            await pcapRepo.createQueryBuilder().delete().where('"frameworkConfigId" = :id', { id: savedFw.id }).execute();
            await asciiRepo.createQueryBuilder().delete().where('"frameworkConfigId" = :id', { id: savedFw.id }).execute();
            for (const t of tracers) {
                if (t.Type === 'PCAP') {
                    await pcapRepo.save(pcapRepo.create({
                        name: t.name,
                        frameworkConfig: savedFw,
                        loggingType: t.LoggingType,
                        timestamp: t.Timestamp,
                        loggerConfiguration: t.LoggerConfiguration,
                    }));
                }
                else if (t.Type === 'ASCII') {
                    await asciiRepo.save(asciiRepo.create({
                        name: t.name,
                        frameworkConfig: savedFw,
                        base: t.Base,
                        internalEventLogged: t.InternalEventLogged ?? false,
                        timeStampSetting: t.TimeStampSetting,
                        timestamp: t.Timestamp,
                        loggerConfiguration: t.LoggerConfiguration,
                    }));
                }
            }
        }
        console.log(`Configuration ${name} saved to DB.`);
    }
    async findById(configId) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        return (0, DataSourceProvider_1.getDataSource)().getRepository(configuration_1.Configuration).findOne({
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
    async findAll() {
        await (0, DataSourceProvider_1.initializeDatabase)();
        return (0, DataSourceProvider_1.getDataSource)().getRepository(configuration_1.Configuration).find({
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
    async deleteById(id) {
        await (0, DataSourceProvider_1.initializeDatabase)();
        const ds = (0, DataSourceProvider_1.getDataSource)();
        const repo = ds.getRepository(configuration_1.Configuration);
        // Delete mappings (ManyToOne back-ref, no cascade on Configuration side)
        await ds.getRepository(mapping_1.Mapping)
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
exports.ConfigurationRepository = ConfigurationRepository;
//# sourceMappingURL=ConfigurationRepository.js.map