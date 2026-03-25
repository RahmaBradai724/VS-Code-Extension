"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Category = void 0;
/**
 * Root abstraction for channel categories.
 * Concrete categories are represented by enums:
 * - LogicalChannelCategory
 * - HardwareChannelCategory
 */
class Category {
    constructor(name) {
        this.name = name;
    }
}
exports.Category = Category;
//# sourceMappingURL=category.js.map