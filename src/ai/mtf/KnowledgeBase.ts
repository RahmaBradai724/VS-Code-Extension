/**
 * KnowledgeBase — loads resources/knowledge_base.json and provides
 * cosine-similarity search over pre-computed embeddings.
 *
 * No native addons required — pure TypeScript arithmetic over float arrays.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface KbChunk {
  id: number;
  text: string;
  metadata: {
    section: string;
    subsection: string;
    source: string;
  };
  embedding: number[];
}

export interface SearchResult {
  chunk: KbChunk;
  score: number;
}

interface KbFile {
  model: string;
  embed_dim: number;
  created_at: string;
  chunk_count: number;
  chunks: KbChunk[];
}

export class KnowledgeBase {
  private readonly chunks: KbChunk[];

  private constructor(chunks: KbChunk[]) {
    this.chunks = chunks;
  }

  // ── Factory ─────────────────────────────────────────────────────────────

  /**
   * Load the knowledge base from the extension's `resources/` directory.
   * Throws if the file doesn't exist.
   */
  static load(resourcesDir: string): KnowledgeBase {
    const kbPath = path.join(resourcesDir, 'knowledge_base.json');
    if (!fs.existsSync(kbPath)) {
      throw new Error(
        `Knowledge base not found at ${kbPath}.\n` +
        'Run:  python scripts/build_knowledge_base.py',
      );
    }
    const raw = fs.readFileSync(kbPath, 'utf-8');
    const kb  = JSON.parse(raw) as KbFile;
    // Filter out any chunks with empty embeddings (build failures)
    const valid = kb.chunks.filter(c => c.embedding && c.embedding.length > 0);
    return new KnowledgeBase(valid);
  }

  /** Total number of indexed chunks. */
  get size(): number {
    return this.chunks.length;
  }

  // ── Search ──────────────────────────────────────────────────────────────

  /**
   * Return the `topK` most relevant chunks for a given query embedding.
   * Uses normalised cosine similarity.
   */
  search(queryEmbedding: number[], topK = 5): SearchResult[] {
    const qNorm = norm(queryEmbedding);
    if (qNorm === 0) { return []; }

    const scored: SearchResult[] = this.chunks.map(chunk => ({
      chunk,
      score: cosineSimilarity(queryEmbedding, chunk.embedding, qNorm),
    }));

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK);
  }
}

// ── Math helpers ─────────────────────────────────────────────────────────────

function norm(v: number[]): number {
  let s = 0;
  for (const x of v) { s += x * x; }
  return Math.sqrt(s);
}

function cosineSimilarity(a: number[], b: number[], aNorm: number): number {
  if (a.length !== b.length) { return 0; }
  let dot = 0, bNorm = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    bNorm += b[i] * b[i];
  }
  const denominator = aNorm * Math.sqrt(bNorm);
  return denominator === 0 ? 0 : dot / denominator;
}
