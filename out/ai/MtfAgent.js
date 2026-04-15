"use strict";
/**
 * MtfAgent — RAG (Retrieval-Augmented Generation) pipeline for
 * MTF Configuration File documentation.
 *
 * Pipeline:
 *   1. Embed the user question via Ollama nomic-embed-text
 *   2. Retrieve the most relevant chunks from KnowledgeBase (cosine search)
 *   3. Build a strict system prompt that grounds the LLM on the retrieved chunks
 *   4. Stream the answer token-by-token via OllamaClient
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MtfAgent = void 0;
const TOP_K = 5;
/** Maximum approximate characters for context (keep it under model context window). */
const MAX_CONTEXT_CHARS = 6000;
class MtfAgent {
    constructor(kb, ollama) {
        this.kb = kb;
        this.ollama = ollama;
    }
    /**
     * Ask a question about the MTF Configuration File.
     *
     * @param question   The user's question.
     * @param onChunk    Called with each streamed token.
     * @param signal     Optional abort signal.
     */
    async ask(question, onChunk, signal) {
        // 1. Embed the question
        const qEmbedding = await this.ollama.embed(question);
        // 2. Retrieve relevant chunks
        const results = this.kb.search(qEmbedding, TOP_K);
        // 3. Build context string (truncate so we stay within token budget)
        const context = buildContext(results);
        // 4. Build messages
        const messages = [
            { role: 'system', content: buildSystemPrompt(context) },
            { role: 'user', content: question },
        ];
        // 5. Stream answer
        const answer = await this.ollama.chat(messages, onChunk, signal);
        return { answer, sources: results };
    }
}
exports.MtfAgent = MtfAgent;
// ── Prompt helpers ────────────────────────────────────────────────────────────
function buildContext(results) {
    const parts = [];
    let totalChars = 0;
    for (const { chunk, score } of results) {
        const header = `[${chunk.metadata.section}${chunk.metadata.subsection ? ' › ' + chunk.metadata.subsection : ''}]`;
        const block = `${header}\n${chunk.text}`;
        if (totalChars + block.length > MAX_CONTEXT_CHARS) {
            // Include first N chars of this chunk if there's room
            const remaining = MAX_CONTEXT_CHARS - totalChars;
            if (remaining > 200) {
                parts.push(block.slice(0, remaining) + ' …');
            }
            break;
        }
        parts.push(block);
        totalChars += block.length;
    }
    return parts.join('\n\n---\n\n');
}
function buildSystemPrompt(context) {
    return `You are an expert technical assistant specialising in the MTF (Modular Test Framework) Configuration File.

INSTRUCTIONS:
- Answer questions ONLY using the documentation context provided below.
- If the answer is not in the context, respond with: "I couldn't find that in the MTF documentation. Please consult the official MTF docs."
- Be concise and precise. Use bullet points for lists of fields or options.
- When mentioning a YAML field, write it in backticks (e.g., \`Id\`, \`Type\`).
- Always cite the documentation section in your answer (e.g., "According to the Channels section…").
- Do NOT invent field names, values, or behaviour that is not in the context.

DOCUMENTATION CONTEXT:
${context}`;
}
//# sourceMappingURL=MtfAgent.js.map