"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationRepository = void 0;
const logicalChannels_1 = require("../../models/logicalChannels");
const hardwareChannels_1 = require("../../models/hardwareChannels");
const configuration_1 = require("../../models/configuration");
const mapping_1 = require("../../models/mapping");
const framework_1 = require("../../models/framework");
const PCAPTracer_1 = require("../../models/framework/PCAPTracer");
const ASCIITracer_1 = require("../../models/framework/ASCIITracer");
const DataSourceProvider_1 = require("./DataSourceProvider");
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
                    'frameworkConfig.diagnostics',
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
                if (ec.npduConfig !== undefined)
                    fwEntity.ethernetConfig.npduConfig = ec.npduConfig;
                if (ec.someIPConfig !== undefined)
                    fwEntity.ethernetConfig.someIPConfig = ec.someIPConfig;
                if (ec.appLayerPorts !== undefined)
                    fwEntity.ethernetConfig.appLayerPorts = ec.appLayerPorts;
                if (ec.ethernetTopology !== undefined)
                    fwEntity.ethernetConfig.ethernetTopology = ec.ethernetTopology;
                if (ec.channelToEcusMapping !== undefined)
                    fwEntity.channelToEcusMapping = ec.channelToEcusMapping;
            }
            const savedFw = await fwRepo.save(fwEntity);
            // Link the saved FrameworkConfig back to the Configuration row
            await repo.update(configId, { frameworkConfig: savedFw });
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
                'frameworkConfig.diagnostics',
                'frameworkConfig.ethernetConfig',
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
                'frameworkConfig.diagnostics',
                'frameworkConfig.ethernetConfig',
                'frameworkConfig.pcapTracers',
                'frameworkConfig.asciiTracers',
            ],
        });
    }
}
exports.ConfigurationRepository = ConfigurationRepository;
//# sourceMappingURL=ConfigurationRepository.js.map