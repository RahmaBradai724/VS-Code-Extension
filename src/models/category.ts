/**
 * Root abstraction for channel categories.
 * Concrete categories are represented by enums:
 * - LogicalChannelCategory
 * - HardwareChannelCategory
 */
export abstract class Category {
  constructor(public readonly name: string) {}
}

