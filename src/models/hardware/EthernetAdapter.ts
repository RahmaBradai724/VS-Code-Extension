import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

// ─────────────────────────────────────────────
//  Ethernet Adapter Hardware Channel
// ─────────────────────────────────────────────
@Entity('hardware_ethernet_adapters')
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
