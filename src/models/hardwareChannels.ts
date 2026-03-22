import { ChildEntity, Column } from 'typeorm';
import { HardwareChannel } from './channel';
import { HardwareChannelCategory } from './enums';

// ─────────────────────────────────────────────
//  LIN Card Hardware Channel
// ─────────────────────────────────────────────
@ChildEntity(HardwareChannelCategory.SERIAL_PORT)
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
@ChildEntity(HardwareChannelCategory.SERIAL_PORT)
export class SerialPort extends HardwareChannel {
  @Column()
  portName: string = '';

  @Column()
  parity: string = 'None';

  @Column()
  query: string = '';

  @Column({ nullable: true })
  stopBit?: string;

  @Column({ nullable: true })
  flowRts?: number;

  @Column({ nullable: true })
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
@ChildEntity(HardwareChannelCategory.HID_RELAY)
export class HIDRelay extends HardwareChannel {
  @Column()
  relayId: number = 0;

  @Column()
  relayChannelName: string = '';

  @Column({ nullable: true })
  relayType?: string;

  @Column({ nullable: true })
  relayNum?: number;

  @Column({ type: 'jsonb', nullable: true })
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
@ChildEntity(HardwareChannelCategory.RELAY_BOARD)
export class RelayBoard extends HardwareChannel {
  @Column()
  ioChannel: number = 0;

  @Column()
  relayChannelName: string = '';

  @Column({ nullable: true })
  relayCount?: number;

  @Column({ nullable: true })
  relayChannelCount?: number;

  @Column({ nullable: true })
  dmerId?: number;

  @Column({ type: 'jsonb', nullable: true })
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
@ChildEntity(HardwareChannelCategory.ETHERNET_ADAPTER)
export class EthernetAdapter extends HardwareChannel {
  @Column()
  macAddress: string = '';

  @Column()
  ipAddress: string = '';

  @Column()
  memberName: string = '';

  @Column()
  bufferSize: number = 0;

  @Column()
  timeout: number = 0;

  @Column()
  immutableMode: boolean = false;

  @Column()
  snapshotLength: number = 0;

  @Column()
  pcapModeMode: boolean = false;

  @Column({ type: 'jsonb', default: [] })
  timeframes: object[] = [];

  @Column()
  immediateDataReadMode: boolean = false;

  @Column()
  dataLoggerType: string = '';

  @Column()
  packetProcessingConfig: boolean = false;

  @Column()
  goodChildLength: boolean = false;

  @Column()
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
@ChildEntity(HardwareChannelCategory.ANALOG_DEVICE)
export class IOAnalog extends HardwareChannel {
  @Column({ nullable: true })
  sensorType?: string;

  @Column({ nullable: true })
  controlId?: string;

  @Column({ nullable: true })
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
@ChildEntity(HardwareChannelCategory.CAN_INTERFACE)
export class CANInterface extends HardwareChannel {
  @Column()
  netChannel: number = 0;

  @Column()
  netHwChannel: number = 0;

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
@ChildEntity(HardwareChannelCategory.CAN_INTERFACE)
export class CIBInterface extends HardwareChannel {
  @Column({ nullable: true })
  bitRate?: number;

  @Column({ nullable: true })
  hwChannel?: number;

  @Column({ nullable: true })
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
