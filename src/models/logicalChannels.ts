import { ChildEntity, Column } from 'typeorm';
import { LogicalChannel } from './channel';
import { LogicalChannelCategory } from './enums';

// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.FLEXRAY)
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
    super(id, name, LogicalChannelCategory.FLEXRAY);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.SERIAL)
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
    super(id, name, LogicalChannelCategory.SERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.CAN)
export class CANChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.CAN);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.CAN_FD)
export class CANFDChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.CAN_FD);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.IOINPUT)
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
  subscriptionConfig?: object;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOINPUT);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.IOOUTPUT)
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
  subscriptionConfig?: object;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOOUTPUT);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.LIN)
export class LINChannel extends LogicalChannel {
  @Column({ nullable: true })
  protocol?: string;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  operationMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.LIN);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.IDSERIAL)
export class IPSChannel extends LogicalChannel {
  @Column()
  openSession: number = 0;

  @Column()
  openInterface: string = '';

  @Column()
  openSessionFields: string = '';

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IDSERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.BRIDGE)
export class BridgeChannel extends LogicalChannel {
  @Column({ nullable: true })
  physicalAdapter?: string;

  @Column({ type: 'jsonb', nullable: true })
  tunTapAdapterList?: object[];

  @Column({ nullable: true })
  manipulatePackets?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.BRIDGE);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
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
@ChildEntity(LogicalChannelCategory.ANALOG)
export class AnalogChannel extends LogicalChannel {
  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
  deviceId?: number;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ANALOG);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.PS)
export class PSChannel extends LogicalChannel {
  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.PS);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
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
@ChildEntity(LogicalChannelCategory.ETHERNET)
export class EthernetChannel extends LogicalChannel {
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
  removedDataLoggerMetaData?: boolean;

  @Column({ nullable: true })
  dataLoggerType?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ETHERNET);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      loggingName: this.loggingName, tracerName: this.tracerName, alias: this.alias,
      friendlyName: this.friendlyName, bufferSize: this.bufferSize,
      pblFilter: this.pblFilter, timeout: this.timeout,
      timeStampPrecision: this.timeStampPrecision,
      timeStampSource: this.timeStampSource, immediateMode: this.immediateMode,
      snapshotLength: this.snapshotLength, dapDeviceMode: this.dapDeviceMode,
      useDataLoggerTimeStamp: this.useDataLoggerTimeStamp,
      removedDataLoggerMetaData: this.removedDataLoggerMetaData,
      dataLoggerType: this.dataLoggerType
    };
  }

  toJSON(): object {
    return this.toYAML();
  }
}
