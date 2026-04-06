"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationRepository = void 0;
const logicalChannels_1 = require("../../models/logicalChannels");
const hardwareChannels_1 = require("../../models/hardwareChannels");
const configuration_1 = require("../../models/configuration");
const mapping_1 = require("../../models/mapping");
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
        console.log(`Configuration ${name} saved to DB.`);
    }
}
exports.ConfigurationRepository = ConfigurationRepository;
//# sourceMappingURL=ConfigurationRepository.js.map