"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tracer = void 0;
// Plain base class – no longer a TypeORM entity.
// Separate pcap_tracers and ascii_tracers tables are used instead.
class Tracer {
    constructor() {
        this.name = '';
    }
}
exports.Tracer = Tracer;
//# sourceMappingURL=Tracer.js.map