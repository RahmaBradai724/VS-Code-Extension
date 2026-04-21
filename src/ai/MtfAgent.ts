/**
 * MtfAgent — RAG (Retrieval-Augmented Generation) pipeline for
 * MTF Configuration File documentation.
 *
 * Pipeline:
 *   1. Embed the user question via Ollama nomic-embed-text
 *   2. Hybrid retrieval: vector cosine + keyword overlap + importance bonus
 *      + graph expansion via relatedIds  (all inside KnowledgeBase.search)
 *   3. Build a grounded system prompt from the retrieved chunks
 *   4. Stream the answer token-by-token via OllamaClient
 */

import { OllamaClient, ChatMessage } from './mtf/OllamaClient';
import { KnowledgeBase, SearchResult } from './mtf/KnowledgeBase';

export interface AgentResponse {
  answer: string;
  sources: SearchResult[];
}

const TOP_K = 5;

/** Maximum approximate characters for context (keep it under model context window). */
const MAX_CONTEXT_CHARS = 3000;

export class MtfAgent {
  constructor(
    private readonly kb: KnowledgeBase,
    private readonly ollama: OllamaClient,
  ) {}

  /**
   * Ask a question about the MTF Configuration File.
   *
   * @param question   The user's question.
   * @param onChunk    Called with each streamed token.
   * @param signal     Optional abort signal.
   */
  async ask(
    question: string,
    onChunk: (token: string) => void,
    signal?: AbortSignal,
  ): Promise<AgentResponse> {
    // 1. Embed the question
    const qEmbedding = await this.ollama.embed(question);

    // 2. Hybrid retrieval (vector + keyword + graph expansion)
    const results = this.kb.search(qEmbedding, question, TOP_K);

    // 3. Build context string (truncate so we stay within token budget)
    const context = buildContext(results);

    // 4. Build messages
    const messages: ChatMessage[] = [
      { role: 'system', content: buildSystemPrompt(context) },
      { role: 'user',   content: question },
    ];

    // 5. Stream answer
    const answer = await this.ollama.chat(messages, onChunk, signal);

    return { answer, sources: results };
  }
}

// ── Prompt helpers ────────────────────────────────────────────────────────────

function buildContext(results: SearchResult[]): string {
  const parts: string[] = [];
  let totalChars = 0;

  for (const { chunk, fromGraph } of results) {
    const sectionLabel = chunk.subsection
      ? `${chunk.section} › ${chunk.subsection}`
      : chunk.section;
    const graphTag = fromGraph ? ' [related]' : '';
    const header   = `[${sectionLabel}${graphTag}]`;
    const block    = `${header}\n**${chunk.title}**\n${chunk.content}`;

    if (totalChars + block.length > MAX_CONTEXT_CHARS) {
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

function buildSystemPrompt(context: string): string {
  return `You are an expert technical assistant for the MTF (Modular Test Framework) Configuration File.

STRICT RULES:
- Answer ONLY using the documentation context provided below. Do NOT use any prior knowledge.
- Quote field names exactly as they appear (e.g. \`Id\`, \`Type\`, \`HWChannel\`).
- If the answer is not in the context, say: "I couldn't find that in the MTF documentation."
- Be concise. Use bullet points for lists of fields or values.

DOCUMENTATION CONTEXT:
${context}`;
}
