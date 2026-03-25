import { ChildEntity, Column } from 'typeorm';
import { HardwareChannel } from './channel';
import { HardwareChannelCategory, HardwareChannelSubclass, CaptureType } from './enums';

// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.LIN_CARD)
export class LINCard extends HardwareChannel {
  @Column({ nullable: true })
  hwModel?: number;

  @Column({ nullable: true })
  bmtStr?: string;

  @Column({ nullable: true })
  bmtList?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.SERIAL_PORT, HardwareChannelSubclass.LIN_CARD);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, hwModel: this.hwModel };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, hwModel: this.hwModel, bmtStr: this.bmtStr, hwChannel: this.hwChannel };
  }
}

// ─────────────────────────────────────────────
//  Serial Port Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.SERIAL_PORT)
export class SerialPort extends HardwareChannel {
  @Column()
  portName: string = '';

  @Column()
  baudRate: number = 9600;

  @Column()
  parity: string = 'None';

  @Column()
  dataBits: number = 8;

  @Column()
  stopBits: string = '1';

  @Column()
  flowControl: string = 'None';

  @Column()
  messageTerminator: string = '';

  @Column()
  separationTimeMs: number = 0;

  @Column()
  maxReceivedDataSize: number = 0;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.SERIAL_PORT, HardwareChannelSubclass.SERIAL_PORT);
  }

  get separationTimes(): number {
    return this.separationTimeMs;
  }

  set separationTimes(value: number) {
    this.separationTimeMs = value;
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      portName: this.portName, baudRate: this.baudRate,
      parity: this.parity, dataBits: this.dataBits,
      stopBits: this.stopBits, flowControl: this.flowControl,
      messageTerminator: this.messageTerminator,
      separationTimes: this.separationTimes,
      maxReceivedDataSize: this.maxReceivedDataSize
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  HID Relay Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.HID_RELAY)
export class HIDRelay extends HardwareChannel {
  @Column({ nullable: true })
  vendorId?: string;

  @Column({ nullable: true })
  productId?: string;

  @Column({ nullable: true })
  deviceSerial?: string;

  @Column({ type: 'jsonb', nullable: true })
  relays?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.HID_RELAY, HardwareChannelSubclass.HID_RELAY);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      vendorId: this.vendorId, productId: this.productId,
      deviceSerial: this.deviceSerial, relays: this.relays
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  Relay Board Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.RELAY_BOARD)
export class RelayBoard extends HardwareChannel {
  @Column({ nullable: true })
  relayCount?: number;

  @Column({ nullable: true })
  channelName?: string;

  @Column({ nullable: true })
  boardId?: number;

  @Column({ type: 'jsonb', nullable: true })
  relays?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.RELAY_BOARD, HardwareChannelSubclass.RELAY_BOARD);
  }

  get canChannelName(): string | undefined {
    return this.channelName;
  }

  set canChannelName(value: string | undefined) {
    this.channelName = value;
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      relayCount: this.relayCount, canChannelName: this.canChannelName,
      boardId: this.boardId, relays: this.relays
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  Ethernet Adapter Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.ETHERNET_ADAPTER)
export class EthernetAdapter extends HardwareChannel {
  @Column()
  macAddress: string = '';

  @Column()
  ipAddress: string = '';

  @Column()
  friendlyName: string = '';

  @Column()
  interface: string = '';

  @Column()
  bufferSize: number = 0;

  @Column()
  bpFilter: string = '';

  @Column()
  timeout: number = 0;

  @Column()
  timeStampPrecision: string = '';

  @Column()
  timeStampSource: string = '';

  @Column()
  immediateMode: boolean = false;

  @Column()
  snapshotLength: number = 0;

  @Column()
  pcapDeviceMode: string = '';

  @Column()
  useDataLoggerTimeStamp: boolean = false;

  @Column()
  removeDataLoggerMetaData: boolean = false;

  @Column()
  dataLoggerType: string = '';

  @Column()
  packetProcessingActive: boolean = false;

  @Column()
  packetIdentificationActive: boolean = false;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.ETHERNET_ADAPTER, HardwareChannelSubclass.ETHERNET_ADAPTER);
  }

  get snapShotLength(): number {
    return this.snapshotLength;
  }

  set snapShotLength(value: number) {
    this.snapshotLength = value;
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      macAddress: this.macAddress, ipAddress: this.ipAddress,
      friendlyName: this.friendlyName, interface: this.interface,
      bufferSize: this.bufferSize, bpFilter: this.bpFilter,
      timeout: this.timeout, timeStampPrecision: this.timeStampPrecision,
      timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
      snapShotLength: this.snapShotLength, pcapDeviceMode: this.pcapDeviceMode,
      useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
      removeDataLoggerMetaData: this.removeDataLoggerMetaData,
      dataLoggerType: this.dataLoggerType,
      packetProcessingActive: this.packetProcessingActive,
      packetIdentificationActive: this.packetIdentificationActive
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  IO Analog Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.ANALOG_DEVICE)
export class AnalogDevice extends HardwareChannel {
  @Column({ nullable: true })
  channels?: number;

  @Column({ nullable: true })
  resolution?: number;

  @Column({ nullable: true })
  measurementAttribute?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  lineContactState?: boolean;

  @Column({ nullable: true })
  gndContactState?: boolean;

  @Column({ nullable: true })
  vbatContactState?: boolean;

  @Column({ nullable: true })
  staticChannel?: boolean;

  @Column({ nullable: true })
  initValue?: string;

  @Column({ nullable: true })
  function?: string;

  @Column({ nullable: true })
  channelType?: string;

  @Column({ nullable: true })
  pwmWindowTime?: number;

  @Column({ type: 'jsonb', nullable: true })
  diagnostics?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.ANALOG_DEVICE, HardwareChannelSubclass.ANALOG_DEVICE);
  }

  get inContactState(): boolean | undefined {
    return this.lineContactState;
  }

  set inContactState(value: boolean | undefined) {
    this.lineContactState = value;
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      channels: this.channels, resolution: this.resolution,
      measurementAttribute: this.measurementAttribute, hwChannel: this.hwChannel,
      inContactState: this.inContactState, gndContactState: this.gndContactState,
      vbatContactState: this.vbatContactState, staticChannel: this.staticChannel,
      initValue: this.initValue, function: this.function,
      channelType: this.channelType, pwmWindowTime: this.pwmWindowTime,
      diagnostics: this.diagnostics
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  TEAnalog Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.TE_ANALOG)
export class TEAnalog extends HardwareChannel {
  @Column({ nullable: true })
  sensorType?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  deviceId?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.TE_ANALOG, HardwareChannelSubclass.TE_ANALOG);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, sensorType: this.sensorType, hwChannel: this.hwChannel, deviceId: this.deviceId };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  CAN Interface Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.CAN_INTERFACE)
export class CANInterface extends HardwareChannel {
  @Column()
  netChannel: number = 0;

  @Column()
  netHwChannel: number = 0;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CAN_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
  }
}

// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.CIB_INTERFACE)
export class CIBInterface extends HardwareChannel {
  @Column({ nullable: true })
  bitRate?: number;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  hwChannel2?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE, HardwareChannelSubclass.CIB_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, bitRate: this.bitRate };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass, bitRate: this.bitRate, hwChannel: this.hwChannel };
  }
}

// ─────────────────────────────────────────────
//  CMInterface Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.CM_INTERFACE)
export class CMInterface extends HardwareChannel {
  @Column({ nullable: true })
  interfaceName?: string;

  @Column({ type: 'varchar', nullable: true })
  captureType?: CaptureType;

  @Column({ nullable: true })
  bitrate?: number;

  @Column({ nullable: true })
  hwChannel?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CM_INTERFACE, HardwareChannelSubclass.CM_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      interfaceName: this.interfaceName, captureType: this.captureType,
      bitrate: this.bitrate, hwChannel: this.hwChannel
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  HHLoad Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelSubclass.HH_LOAD)
export class HHLoad extends HardwareChannel {
  @Column({ type: 'float', nullable: true })
  maxLoad?: number;

  @Column({ nullable: true })
  deviceId?: number;

  @Column({ nullable: true })
  portName?: string;

  @Column({ nullable: true })
  flag?: boolean;

  @Column({ nullable: true })
  bitRate?: number;

  @Column({ nullable: true })
  loadType?: string; // Using loadType to avoid conflict with 'type' from base class

  @Column({ type: 'jsonb', nullable: true })
  channels?: object;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.HH_LOAD, HardwareChannelSubclass.HH_LOAD);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      maxLoad: this.maxLoad, deviceId: this.deviceId,
      portName: this.portName, bitRate: this.bitRate,
      loadType: this.loadType, flag: this.flag, channels: this.channels
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
