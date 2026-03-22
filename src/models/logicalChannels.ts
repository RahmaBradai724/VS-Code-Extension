import { ChildEntity, Column } from 'typeorm';
import { LogicalChannel } from './channel';
import { LogicalChannelCategory } from './enums';

// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.FLEXRAY)
export class FlexRayChannel extends LogicalChannel {
  @Column({ nullable: true })
  optionStr?: string;

  @Column({ nullable: true })
  genlId?: string;

  @Column({ nullable: true })
  optionId?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.FLEXRAY);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, optionStr: this.optionStr };
  }

  toJSON(): object {
    return { ...this.toYAML(), optionId: this.optionId };
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
  dataClass: string = '';

  @Column()
  query: string = '';

  @Column()
  dataBits: number = 8;

  @Column()
  baudRate: number = 9600;

  @Column()
  stopBits: string = '1';

  @Column()
  parity: string = 'None';

  @Column()
  bufferedData: number = 0;

  @Column()
  dataAcquisitionMode: string = '';

  @Column({ nullable: true })
  serialChannelAdditionalOptions?: boolean;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.SERIAL);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      portName: this.portName, baudRate: this.baudRate,
      dataBits: this.dataBits, stopBits: this.stopBits, parity: this.parity,
    };
  }

  toJSON(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      portName: this.portName, dataClass: this.dataClass, query: this.query,
      dataBits: this.dataBits, baudRate: this.baudRate, stopBits: this.stopBits,
      parity: this.parity, bufferedData: this.bufferedData,
      dataAcquisitionMode: this.dataAcquisitionMode,
      serialChannelAdditionalOptions: this.serialChannelAdditionalOptions,
    };
  }
}

// ─────────────────────────────────────────────
//  CAN Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.CAN)
export class CANChannel extends LogicalChannel {
  @Column({ nullable: true })
  dbcChannel?: number;

  @Column({ nullable: true })
  connectionMode?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.CAN);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, dbcChannel: this.dbcChannel };
  }

  toJSON(): object {
    return { ...this.toYAML(), connectionMode: this.connectionMode };
  }
}

// ─────────────────────────────────────────────
//  IO Input Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.IOINPUT)
export class IOInputChannel extends LogicalChannel {
  @Column()
  ioChannel: number = 0;

  @Column()
  measurementAttribute: string = '';

  @Column()
  controlState: boolean = false;

  @Column()
  loSideRelay: boolean = false;

  @Column()
  infoStatus: boolean = false;

  @Column()
  dataChannelName: string = '';

  @Column({ type: 'jsonb', nullable: true })
  measurementConfig?: object;

  @Column({ type: 'jsonb', default: [] })
  subscriptionDetails: object[] = [];

  @Column()
  openMinTimeMs: number = 0;

  @Column({ type: 'jsonb', nullable: true })
  subscriptionConfig?: object;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOINPUT);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, ioChannel: this.ioChannel };
  }

  toJSON(): object {
    return { ...this, ...this.toYAML() };
  }
}

// ─────────────────────────────────────────────
//  IO Output Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.IOOUTPUT)
export class IOOutputChannel extends LogicalChannel {
  @Column()
  ioChannel: number = 0;

  @Column()
  measurementAttribute: string = '';

  @Column()
  timeControlMode: boolean = false;

  @Column()
  timeControlInterval: string = '';

  @Column()
  openWorkTime: boolean = false;

  @Column({ type: 'jsonb', nullable: true })
  measurementConfig?: object;

  @Column({ type: 'jsonb', default: [] })
  packetProcessingConfig: object[] = [];

  @Column()
  endlaue: string = '';

  @Column()
  channelType: string = '';

  @Column({ type: 'jsonb', default: [] })
  ports: object[] = [];

  @Column()
  portMinTimeMs: number = 0;

  @Column({ type: 'jsonb', nullable: true })
  subscriptionConfig?: object;;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.IOOUTPUT);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, ioChannel: this.ioChannel };
  }

  toJSON(): object {
    return { ...this, ...this.toYAML() };
  }
}

// ─────────────────────────────────────────────
//  LIN Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.LIN)
export class LINChannel extends LogicalChannel {
  @Column()
  openSession: number = 0;

  @Column()
  loggingName: string = '';

  @Column()
  loggingType: LogicalChannelCategory = LogicalChannelCategory.LIN;

  @Column({ type: 'jsonb', default: [] })
  dbList: string[] = [];

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.LIN);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type };
  }

  toJSON(): object {
    return { ...this.toYAML(), loggingName: this.loggingName, dbList: this.dbList };
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
    return { id: this.id, name: this.name, type: this.type, openSession: this.openSession };
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
  @Column({ type: 'jsonb', nullable: true })
  hlcChannel?: HardwareChannel_Ref;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.BRIDGE);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type };
  }

  toJSON(): object {
    return { ...this.toYAML(), hlcChannel: this.hlcChannel };
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
  sensorType?: string;

  @Column({ nullable: true })
  controlId?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ANALOG);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType };
  }

  toJSON(): object {
    return { ...this.toYAML(), controlId: this.controlId };
  }
}

// ─────────────────────────────────────────────
//  Ethernet Logical Channel
// ─────────────────────────────────────────────
@ChildEntity(LogicalChannelCategory.ETHERNET)
export class EthernetChannel extends LogicalChannel {
  @Column()
  friendlyName: string = '';

  @Column()
  bufferSize: number = 0;

  @Column()
  timeout: number = 0;

  @Column()
  timeframeName: string = '';

  @Column()
  timeframePrecision: string = '';

  @Column()
  timeframeSource: string = '';

  @Column()
  timestampBound: number = 0;

  @Column()
  snapshotLength: number = 0;

  @Column()
  defSaveMode: number = 0;

  @Column()
  defDataSupportTimeStamp: boolean = false;

  @Column()
  sendDataLoggerMeta: boolean = false;

  @Column()
  dataLoggerType: string = '';

  @Column()
  packetProcessingConfig: boolean = false;

  @Column()
  differentHandlerForIuluAndR: boolean = false;

  @Column()
  useFlexRayBaudRate: boolean = false;

  @Column({ nullable: true })
  captureType?: string;

  constructor(id: string, name: string) {
    super(id, name, LogicalChannelCategory.ETHERNET);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      friendlyName: this.friendlyName, bufferSize: this.bufferSize,
      snapshotLength: this.snapshotLength, captureType: this.captureType,
    };
  }

  toJSON(): object {
    return { ...this };
  }
}
