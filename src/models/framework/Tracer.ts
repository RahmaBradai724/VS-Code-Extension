// Plain base class – no longer a TypeORM entity.
// Separate pcap_tracers and ascii_tracers tables are used instead.
export abstract class Tracer {
  name: string = '';

  abstract toYAML(): object;
  abstract toJSON(): object;
}
