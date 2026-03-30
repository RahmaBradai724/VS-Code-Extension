import { Entity, Column } from 'typeorm';
import { LogicalChannel } from '../LogicalChannel';
import { LogicalChannelCategory, LogicalChannelSubclass } from '../enums';


@Entity('logical_ethernet_channels')
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
