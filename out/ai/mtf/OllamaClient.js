"use strict";
/**
 * OllamaClient — lightweight TypeScript client for the local Ollama REST API.
 *
 * Supports:
 *   - /api/embeddings  → embed a text string
 *   - /api/chat        → streaming chat (LLM generation)
 *   - /api/tags        → check whether the server is available
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaClient = void 0;
class OllamaClient {
    constructor(base = 'http://localhost:11434', embedModel = 'nomic-embed-text', chatModel = 'llama3.2') {
        this.base = base;
        this.embedModel = embedModel;
        this.chatModel = chatModel;
    }
    // ── Public API ──────────────────────────────────────────────────────────
    /** Returns true when Ollama is reachable (doesn't check models). */
    async isAvailable() {
        try {
            const resp = await fetch(`${this.base}/api/tags`, { signal: AbortSignal.timeout(4000) });
            return resp.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * Embed `text` with the configured embedding model.
     * Returns the raw float vector.
     */
    async embed(text) {
        const resp = await fetch(`${this.base}/api/embeddings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: this.embedModel, prompt: text }),
            signal: AbortSignal.timeout(30000),
        });
        if (!resp.ok) {
            throw new Error(`Ollama embed failed: ${resp.status} ${await resp.text()}`);
        }
        const data = await resp.json();
        return data.embedding;
    }
    /**
     * Stream a chat completion.
     * `onChunk` is called with each text delta.
     * Returns the full assembled response text.
     */
    async chat(messages, onChunk, abortSignal) {
        const resp = await fetch(`${this.base}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: this.chatModel,
                messages,
                stream: true,
            }),
            signal: abortSignal ?? AbortSignal.timeout(120000),
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
            if (done) {
                break;
            }
            const raw = decoder.decode(value, { stream: true });
            // Each line is a JSON object from the Ollama stream
            for (const line of raw.split('\n')) {
                const trimmed = line.trim();
                if (!trimmed) {
                    continue;
                }
                try {
                    const obj = JSON.parse(trimmed);
                    const token = obj.message?.content ?? '';
                    if (token) {
                        full += token;
                        onChunk(token);
                    }
                }
                catch {
                    // partial JSON chunk — skip
                }
            }
        }
        return full;
    }
}
exports.OllamaClient = OllamaClient;
//# sourceMappingURL=OllamaClient.js.map