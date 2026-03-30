import { Entity, Column } from 'typeorm';
import { HardwareChannel } from '../HardwareChannel';
import { HardwareChannelCategory, HardwareChannelSubclass } from '../enums';

@Entity('hardware_analog_devices')
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
