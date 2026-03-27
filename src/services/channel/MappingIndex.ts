/**
 * MappingIndex tracks which mapping IDs reference which channel IDs.
 * SRP: index management only — no channel business logic.
 */
export class MappingIndex {
  private index: Map<string, Set<string>> = new Map();

  register(channelId: string, mappingId: string): void {
    if (!this.index.has(channelId)) {
      this.index.set(channelId, new Set());
    }
    this.index.get(channelId)!.add(mappingId);
  }

  unregister(channelId: string, mappingId: string): void {
    this.index.get(channelId)?.delete(mappingId);
  }

  getMappingsForChannel(channelId: string): Set<string> {
    return this.index.get(channelId) || new Set();
  }

  delete(channelId: string): void {
    this.index.delete(channelId);
  }

  clear(): void {
    this.index.clear();
  }
}
