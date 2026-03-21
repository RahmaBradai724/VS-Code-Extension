import { HardwareChannel } from './channel';
import { HardwareChannelCategory } from './enums';

// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
export class LINCard extends HardwareChannel {
  hwModel?: number;
  bmtStr?: string;
  bmtList?: string;
  hwChannel?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.SERIAL_PORT);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, hwModel: this.hwModel };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, hwModel: this.hwModel, bmtStr: this.bmtStr, hwChannel: this.hwChannel };
  }
}

// ─────────────────────────────────────────────
//  Serial Port Hardware Channel
// ─────────────────────────────────────────────
export class SerialPort extends HardwareChannel {
  portName: string = '';
  parity: string = 'None';
  query: string = '';
  stopBit?: string;
  flowRts?: number;
  receiveAllMessageDsBit?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.SERIAL_PORT);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, portName: this.portName, parity: this.parity };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  HID Relay Hardware Channel
// ─────────────────────────────────────────────
export class HIDRelay extends HardwareChannel {
  relayId: number = 0;
  relayChannelName: string = '';
  relayType?: string;
  relayNum?: number;
  return_Map?: Map<string, string>;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.HID_RELAY);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, relayId: this.relayId };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, relayId: this.relayId, relayChannelName: this.relayChannelName };
  }
}

// ─────────────────────────────────────────────
//  Relay Board Hardware Channel
// ─────────────────────────────────────────────
export class RelayBoard extends HardwareChannel {
  ioChannel: number = 0;
  relayChannelName: string = '';
  relayCount?: number;
  relayChannelCount?: number;
  dmerId?: number;
  Mapping?: Map<string, string>;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.RELAY_BOARD);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, ioChannel: this.ioChannel };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  Ethernet Adapter Hardware Channel
// ─────────────────────────────────────────────
export class EthernetAdapter extends HardwareChannel {
  macAddress: string = '';
  ipAddress: string = '';
  memberName: string = '';
  bufferSize: number = 0;
  timeout: number = 0;
  immutableMode: boolean = false;
  snapshotLength: number = 0;
  pcapModeMode: boolean = false;
  timeframes: object[] = [];
  immediateDataReadMode: boolean = false;
  dataLoggerType: string = '';
  packetProcessingConfig: boolean = false;
  goodChildLength: boolean = false;
  positionIdentificationActive: boolean = false;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.ETHERNET_ADAPTER);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return {
      id: this.id, name: this.name, type: this.type,
      macAddress: this.macAddress, ipAddress: this.ipAddress,
      bufferSize: this.bufferSize, snapshotLength: this.snapshotLength,
    };
  }

  toJSON(): object {
    return { ...this };
  }
}

// ─────────────────────────────────────────────
//  IO Analog Hardware Channel
// ─────────────────────────────────────────────
export class IOAnalog extends HardwareChannel {
  sensorType?: string;
  controlId?: string;
  portId?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.ANALOG_DEVICE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, sensorType: this.sensorType, portId: this.portId };
  }
}

// ─────────────────────────────────────────────
//  CAN Interface Hardware Channel
// ─────────────────────────────────────────────
export class CANInterface extends HardwareChannel {
  netChannel: number = 0;
  netHwChannel: number = 0;
  setHwChannel?: (channel: number) => void;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, netChannel: this.netChannel, netHwChannel: this.netHwChannel };
  }
}

// ─────────────────────────────────────────────
//  CIB Interface Hardware Channel
// ─────────────────────────────────────────────
export class CIBInterface extends HardwareChannel {
  bitRate?: number;
  hwChannel?: number;
  hwChannel2?: number;

  constructor(id: string, name: string) {
    super(id, name, HardwareChannelCategory.CAN_INTERFACE);
  }

  canDelete(mappingIds: string[]): boolean {
    return !mappingIds.includes(this.id);
  }

  toYAML(): object {
    return { id: this.id, name: this.name, type: this.type, bitRate: this.bitRate };
  }

  toJSON(): object {
    return { id: this.id, name: this.name, type: this.type, bitRate: this.bitRate, hwChannel: this.hwChannel };
  }
}
