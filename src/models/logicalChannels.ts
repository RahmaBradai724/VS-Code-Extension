import { ChildEntity, Column } from 'typeorm';
import { LogicalChannel } from './channel';
import { LogicalChannelCategory, LogicalChannelSubclass } from './enums';

export interface TunTapAdapter {
  [key: string]: unknown;
}

// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.FLEXRAY)
export class FlexRayChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  keySlot?: number;

  @Column({ nullable: true })
  nodeType?: string;

  @Column({ nullable: true })
  wakeUpCluster?: boolean;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.FLEXRAY, LogicalChannelSubclass.FLEXRAY);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, keySlot: this.keySlot,
      nodeType: this.nodeType, wakeUpCluster: this.wakeUpCluster,
      operationMode: this.operationMode
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  Serial Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.SERIAL)
export class SerialChannel extends LogicalChannel {
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
  maxReceivedDataSize: number = 0;

  @Column()
  separationTimeMs: number = 0;

  @Column({ nullable: true })
  serialChannelActivationOptional?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.SERIAL, LogicalChannelSubclass.SERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      portName: this.portName, baudRate: this.baudRate,
      parity: this.parity, dataBits: this.dataBits,
      stopBits: this.stopBits, flowControl: this.flowControl,
      messageTerminator: this.messageTerminator,
      maxReceivedDataSize: this.maxReceivedDataSize,
      separationTimeMs: this.separationTimeMs,
      serialChannelActivationOptional: this.serialChannelActivationOptional,
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  CAN Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.CAN)
export class CANChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.CAN, LogicalChannelSubclass.CAN);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, operationMode: this.operationMode
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  CAN FD Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.CAN_FD)
export class CANFDChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.CAN_FD, LogicalChannelSubclass.CAN_FD);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, operationMode: this.operationMode
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  IO Input Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.IOINPUT)
export class IOInputChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  measurementAttribute?: string;

  @Column({ nullable: true })
  function?: string;

  @Column({ nullable: true })
  lineContactState?: boolean;

  @Column({ nullable: true })
  gndContactState?: boolean;

  @Column({ nullable: true })
  batContactState?: boolean;

  @Column({ nullable: true })
  staticChannel?: boolean;

  @Column({ nullable: true })
  initValue?: string;

  @Column({ nullable: true })
  channelType?: string;

  @Column({ type: 'jsonb', nullable: true })
  measurementConfig?: string[];

  @Column({ nullable: true })
  pwmWindowTime?: number;

  @Column({ type: 'jsonb', nullable: true })
  subscriptionConfig?: Record<string, unknown>;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOINPUT, LogicalChannelSubclass.IOINPUT);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, measurementAttribute: this.measurementAttribute,
      function: this.function, lineContactState: this.lineContactState,
      gndContactState: this.gndContactState, batContactState: this.batContactState,
      staticChannel: this.staticChannel, initValue: this.initValue,
      channelType: this.channelType, measurementConfig: this.measurementConfig,
      pwmWindowTime: this.pwmWindowTime, subscriptionConfig: this.subscriptionConfig
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  IO Output Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.IOOUTPUT)
export class IOOutputChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  measurementAttribute?: string;

  @Column({ nullable: true })
  function?: string;

  @Column({ nullable: true })
  lineContactState?: boolean;

  @Column({ nullable: true })
  gndContactState?: boolean;

  @Column({ nullable: true })
  batContactState?: boolean;

  @Column({ nullable: true })
  staticChannel?: boolean;

  @Column({ nullable: true })
  initValue?: string;

  @Column({ nullable: true })
  channelType?: string;

  @Column({ type: 'jsonb', nullable: true })
  measurementConfig?: string[];

  @Column({ nullable: true })
  pwmWindowTime?: number;

  @Column({ type: 'jsonb', nullable: true })
  subscriptionConfig?: Record<string, unknown>;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOOUTPUT, LogicalChannelSubclass.IOOUTPUT);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, measurementAttribute: this.measurementAttribute,
      function: this.function, lineContactState: this.lineContactState,
      gndContactState: this.gndContactState, batContactState: this.batContactState,
      staticChannel: this.staticChannel, initValue: this.initValue,
      channelType: this.channelType, measurementConfig: this.measurementConfig,
      pwmWindowTime: this.pwmWindowTime, subscriptionConfig: this.subscriptionConfig
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  LIN Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.LIN)
export class LINChannel extends LogicalChannel {
  @Column({ nullable: true })
  protocol?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.LIN, LogicalChannelSubclass.LIN);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      protocol: this.protocol, hwChannel: this.hwChannel,
      operationMode: this.operationMode
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  IPS Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.IOSERIAL)
export class IPSChannel extends LogicalChannel {
  @Column()
  openSession: number = 0;

  @Column()
  openInterface: string = '';

  @Column()
  openSessionFields: string = '';

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOSERIAL, LogicalChannelSubclass.IOSERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      openSession: this.openSession
    };
  }

  toJSON(): object {
    return { ...this.toYAML(), openInterface: this.openInterface };
  }
}

// ─────────────────────────────────────────────
//  Bridge Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.BRIDGE)
export class BridgeChannel extends LogicalChannel {
  @Column({ nullable: true })
  bridgeName?: string;

  @Column({ nullable: true })
  physicalAdapter?: string;

  @Column({ type: 'jsonb', nullable: true })
  tunTapAdapterList?: TunTapAdapter[];

  @Column({ nullable: true })
  manipulatePackets?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.BRIDGE, LogicalChannelSubclass.BRIDGE);
    this.bridgeName = name;
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      bridgeName: this.bridgeName ?? this.name,
      physicalAdapter: this.physicalAdapter,
      tunTapAdapterList: this.tunTapAdapterList,
      manipulatePackets: this.manipulatePackets
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// Reference to a hardware channel (avoid circular deps)
export interface HardwareChannel_Ref {
  hwChannelId: string;
  name: string;
}

// ─────────────────────────────────────────────
//  Analog Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.ANALOG)
export class AnalogChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  deviceId?: number;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ANALOG, LogicalChannelSubclass.ANALOG);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      hwChannel: this.hwChannel, deviceId: this.deviceId
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  PS Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.PS)
export class PSChannel extends LogicalChannel {
  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.PS, LogicalChannelSubclass.PS);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}

// ─────────────────────────────────────────────
//  Ethernet Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelSubclass.ETHERNET)
export class EthernetChannel extends LogicalChannel {
  @Column({ nullable: true })
  ethernetName?: string;

  @Column({ nullable: true })
  friendlyName?: string;

  @Column({ nullable: true })
  bufferSize?: number;

  @Column({ nullable: true })
  pblFilter?: string;

  @Column({ nullable: true })
  timeout?: number;

  @Column({ nullable: true })
  timeStampPrecision?: string;

  @Column({ nullable: true })
  timeStampSource?: string;

  @Column({ nullable: true })
  immediateMode?: boolean;

  @Column({ nullable: true })
  snapshotLength?: number;

  @Column({ nullable: true })
  dapDeviceMode?: string;

  @Column({ nullable: true })
  useDataLoggerTimeStamp?: boolean;

  @Column({ nullable: true })
  removeDataLoggerMetaData?: boolean;

  @Column({ nullable: true })
  dataLoggerType?: string;

  @Column({ nullable: true })
  packetProcessingActive?: boolean;

  @Column({ nullable: true })
  packetIdentificationActive?: boolean;

  @Column({ nullable: true })
  differentHandlerForTxAndRx?: boolean;

  @Column({ nullable: true })
  tccmPacketizationActive?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ETHERNET, LogicalChannelSubclass.ETHERNET);
    this.ethernetName = name;
  }

  get pbIFilter(): string | undefined {
    return this.pblFilter;
  }

  set pbIFilter(value: string | undefined) {
    this.pblFilter = value;
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type, category: this.category, subclass: this.subclass,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      ethernetName: this.ethernetName ?? this.name,
      friendlyName: this.friendlyName, bufferSize: this.bufferSize,
      pblFilter: this.pblFilter, timeout: this.timeout,
      timeStampPrecision: this.timeStampPrecision,
      timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
      snapshotLength: this.snapshotLength, dapDeviceMode: this.dapDeviceMode,
      useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
      removeDataLoggerMetaData: this.removeDataLoggerMetaData,
      dataLoggerType: this.dataLoggerType,
      packetProcessingActive: this.packetProcessingActive,
      packetIdentificationActive: this.packetIdentificationActive,
      differentHandlerForTxAndRx: this.differentHandlerForTxAndRx,
      tccmPacketizationActive: this.tccmPacketizationActive
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
