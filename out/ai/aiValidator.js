"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIValidator = void 0;
const LocalValidator_1 = require("./LocalValidator");
/**
 * AIValidator now wraps local validation only.
 */
class AIValidator {
    constructor(localValidator = new LocalValidator_1.LocalValidator()) {
        this.localValidator = localValidator;
    }
    /** Run local checks only (no API call). */
    validate(config, mappings) {
        return this.localValidator.validate(config, mappings);
    }
    /** Preserves the existing command path while using local validation only. */
    async runAIValidation(config, mappings, _yamlContent) {
        return this.localValidator.validate(config, mappings);
    }
}
exports.AIValidator = AIValidator;
//# sourceMappingURL=aiValidator.js.map