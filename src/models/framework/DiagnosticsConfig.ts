import { Column } from 'typeorm';

// ─────────────────────────────────────────────
//  Diagnostics Config
// ─────────────────────────────────────────────
export class DiagnosticsConfig {
  @Column()
  ecuIpAddress: string = '';

  @Column()
  testerIpAddress: string = '';

  @Column()
  protocol: string = '';

  @Column()
  netId: string = '';

  @Column({ nullable: true })
  rai?: string;

  toYAML(): object {
    return { ecuIpAddress: this.ecuIpAddress, testerIpAddress: this.testerIpAddress, protocol: this.protocol, netId: this.netId };
  }

  toJSON(): object {
    return { ...this };
  }
}
