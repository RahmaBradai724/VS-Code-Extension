/**
 * OllamaClient — lightweight TypeScript client for the local Ollama REST API.
 *
 * Supports:
 *   - /api/embeddings  → embed a text string
 *   - /api/chat        → streaming chat (LLM generation)
 *   - /api/tags        → check whether the server is available
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export class OllamaClient {
  constructor(
    private readonly base: string = 'http://localhost:11434',
    private readonly embedModel: string = 'nomic-embed-text',
    private readonly chatModel: string = 'llama3.2',
  ) {}

  // ── Public API ──────────────────────────────────────────────────────────

  /** Returns true when Ollama is reachable (doesn't check models). */
  async isAvailable(): Promise<boolean> {
    try {
      const resp = await fetch(`${this.base}/api/tags`, { signal: AbortSignal.timeout(4000) });
      return resp.ok;
    } catch {
      return false;
    }
  }

  /**
   * Embed `text` with the configured embedding model.
   * Returns the raw float vector.
   */
  async embed(text: string): Promise<number[]> {
    const resp = await fetch(`${this.base}/api/embeddings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.embedModel, prompt: text }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!resp.ok) {
      throw new Error(`Ollama embed failed: ${resp.status} ${await resp.text()}`);
    }
    const data = await resp.json() as { embedding: number[] };
    return data.embedding;
  }

  /**
   * Stream a chat completion.
   * `onChunk` is called with each text delta.
   * Returns the full assembled response text.
   */
  async chat(
    messages: ChatMessage[],
    onChunk: (token: string) => void,
    abortSignal?: AbortSignal,
  ): Promise<string> {
    const resp = await fetch(`${this.base}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.chatModel,
        messages,
        stream: true,
      }),
      signal: abortSignal ?? AbortSignal.timeout(120_000),
    });

    if (!resp.ok) {
      throw new Error(`Ollama chat failed: ${resp.status} ${await resp.text()}`);
    }
    if (!resp.body) {
      throw new Error('Ollama returned no response body');
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let full = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) { break; }

      const raw = decoder.decode(value, { stream: true });
      // Each line is a JSON object from the Ollama stream
      for (const line of raw.split('\n')) {
        const trimmed = line.trim();
        if (!trimmed) { continue; }
        try {
          const obj = JSON.parse(trimmed) as { message?: { content?: string }; done?: boolean };
          const token = obj.message?.content ?? '';
          if (token) {
            full += token;
            onChunk(token);
          }
        } catch {
          // partial JSON chunk — skip
        }
      }
    }

    return full;
  }
}
