/**
 * Strategy interface for protocol compatibility rules.
 * OCP: implement a new strategy to change rules without modifying MappingManager.
 */
export interface ICompatibilityStrategy {
  isCompatible(logicalCategory: string, hardwareCategory: string): boolean;
  getCompatibleHardware(logicalCategory: string): string[];
}
