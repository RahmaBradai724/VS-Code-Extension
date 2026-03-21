import { LogicalChannel } from './channel';
import { LogicalChannelCategory } from './enums';

// ─────────────────────────────────────────────
//  FlexRay Logical Channel
// ─────────────────────────────────────────────
export class FlexRayChannel extends LogicalChannel {
  optionStr?: string;
  genlId?: string;
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
export class SerialChannel extends LogicalChannel {
  portName: string = '';
  dataClass: string = '';
  query: string = '';
  dataBits: number = 8;
  baudRate: number = 9600;
  stopBits: string = '1';
  parity: string = 'None';
  bufferedData: number = 0;
  dataAcquisitionMode: string = '';
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
export class CANChannel extends LogicalChannel {
  dbcChannel?: number;
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
export class IOInputChannel extends LogicalChannel {
  ioChannel: number = 0;
  measurementAttribute: string = '';
  controlState: boolean = false;
  loSideRelay: boolean = false;
  infoStatus: boolean = false;
  dataChannelName: string = '';
  measurementConfig?: object;
  subscriptionDetails: object[] = [];
  openMinTimeMs: number = 0;
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
export class IOOutputChannel extends LogicalChannel {
  ioChannel: number = 0;
  measurementAttribute: string = '';
  timeControlMode: boolean = false;
  timeControlInterval: string = '';
  openWorkTime: boolean = false;
  measurementConfig?: object;
  packetProcessingConfig: object[] = [];
  endlaue: string = '';
  channelType: string = '';
  ports: object[] = [];
  portMinTimeMs: number = 0;
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
export class LINChannel extends LogicalChannel {
  openSession: number = 0;
  loggingName: string = '';
  loggingType: LogicalChannelCategory = LogicalChannelCategory.LIN;
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
export class IPSChannel extends LogicalChannel {
  openSession: number = 0;
  openInterface: string = '';
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
export class BridgeChannel extends LogicalChannel {
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
export class AnalogChannel extends LogicalChannel {
  sensorType?: string;
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
export class EthernetChannel extends LogicalChannel {
  friendlyName: string = '';
  bufferSize: number = 0;
  timeout: number = 0;
  timeframeName: string = '';
  timeframePrecision: string = '';
  timeframeSource: string = '';
  timestampBound: number = 0;
  snapshotLength: number = 0;
  defSaveMode: number = 0;
  defDataSupportTimeStamp: boolean = false;
  sendDataLoggerMeta: boolean = false;
  dataLoggerType: string = '';
  packetProcessingConfig: boolean = false;
  differentHandlerForIuluAndR: boolean = false;
  useFlexRayBaudRate: boolean = false;
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
