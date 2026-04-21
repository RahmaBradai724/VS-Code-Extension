"use strict";
/**
 * KnowledgeBase — loads resources/knowledge_base.json and provides
 * hybrid retrieval (vector cosine + keyword BM25-style) plus optional
 * graph expansion via relatedIds.
 *
 * No native addons required — pure TypeScript arithmetic over float arrays.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeBase = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ── Hybrid search weights ────────────────────────────────────────────────────
/**
 * Final score = VECTOR_WEIGHT × vectorScore + KEYWORD_WEIGHT × keywordScore
 * + IMPORTANCE_BONUS[importance]
 *
 * Tuning guide:
 *   - Increase VECTOR_WEIGHT for better semantic / paraphrase queries
 *   - Increase KEYWORD_WEIGHT for exact-field-name lookups (e.g. "Id", "Type")
 *   - Current: 65/35 split — good balance for MTF doc with technical keywords
 */
const VECTOR_WEIGHT = 0.65;
const KEYWORD_WEIGHT = 0.35;
const IMPORTANCE_BONUS = {
    high: 0.05,
    medium: 0.0,
    low: -0.02,
};
// ── KnowledgeBase class ──────────────────────────────────────────────────────
class KnowledgeBase {
    constructor(chunks) {
        this.chunks = chunks;
        this.index = new Map(chunks.map(c => [c.chunk_id, c]));
    }
    // ── Factory ──────────────────────────────────────────────────────────────
    static load(resourcesDir) {
        const kbPath = path.join(resourcesDir, 'knowledge_base.json');
        if (!fs.existsSync(kbPath)) {
            throw new Error(`Knowledge base not found at ${kbPath}.\n` +
                'Run:  python scripts/build_knowledge_base.py');
        }
        const raw = fs.readFileSync(kbPath, 'utf-8');
        const kb = JSON.parse(raw);
        const valid = kb.chunks.filter(c => c.embedding && c.embedding.length > 0);
        return new KnowledgeBase(valid);
    }
    get size() { return this.chunks.length; }
    // ── Hybrid search ────────────────────────────────────────────────────────
    /**
     * Hybrid retrieval:
     *   1. Vector cosine similarity against query embedding
     *   2. Keyword overlap score against query tokens
     *   3. Combined with VECTOR_WEIGHT / KEYWORD_WEIGHT + importance bonus
     *   4. Graph expansion: for top results, also fetch their relatedIds neighbours
     *
     * @param queryEmbedding  768-dim vector from Ollama nomic-embed-text
     * @param queryText       Raw query string (used for keyword scoring)
     * @param topK            Number of final results to return
     */
    search(queryEmbedding, queryText, topK = 5) {
        const qNorm = norm(queryEmbedding);
        const qTokens = tokenise(queryText);
        // Step 1 + 2: score every chunk
        const scored = this.chunks.map(chunk => {
            const vectorScore = qNorm === 0 ? 0 : cosineSimilarity(queryEmbedding, chunk.embedding, qNorm);
            const keywordScore = keywordOverlap(qTokens, chunk.keywords, chunk.title, chunk.content);
            const bonus = IMPORTANCE_BONUS[chunk.importance] ?? 0;
            const score = VECTOR_WEIGHT * vectorScore + KEYWORD_WEIGHT * keywordScore + bonus;
            return { chunk, score, vectorScore, keywordScore, fromGraph: false };
        });
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, topK);
        // Step 3: graph expansion — add neighbours of top results (deduplicated)
        const seen = new Set(top.map(r => r.chunk.chunk_id));
        const expanded = [...top];
        for (const result of top) {
            for (const relId of result.chunk.relatedIds) {
                if (seen.has(relId)) {
                    continue;
                }
                const neighbour = this.index.get(relId);
                if (!neighbour) {
                    continue;
                }
                const vectorScore = qNorm === 0 ? 0 : cosineSimilarity(queryEmbedding, neighbour.embedding, qNorm);
                const keywordScore = keywordOverlap(qTokens, neighbour.keywords, neighbour.title, neighbour.content);
                const bonus = IMPORTANCE_BONUS[neighbour.importance] ?? 0;
                // Dampen the graph-expanded score slightly so direct hits rank first
                const score = 0.9 * (VECTOR_WEIGHT * vectorScore + KEYWORD_WEIGHT * keywordScore + bonus);
                expanded.push({ chunk: neighbour, score, vectorScore, keywordScore, fromGraph: true });
                seen.add(relId);
            }
        }
        expanded.sort((a, b) => b.score - a.score);
        return expanded.slice(0, topK + 3); // allow a few extra from graph
    }
    /**
     * Pure keyword search — no embedding needed, runs in <5 ms.
     * Scores every chunk by keyword overlap + importance, then graph-expands.
     */
    keywordSearch(queryText, topK = 5) {
        const qTokens = tokenise(queryText);
        const scored = this.chunks.map(chunk => {
            const keywordScore = keywordOverlap(qTokens, chunk.keywords, chunk.title, chunk.content);
            const bonus = IMPORTANCE_BONUS[chunk.importance] ?? 0;
            const score = keywordScore + bonus;
            return { chunk, score, vectorScore: 0, keywordScore, fromGraph: false };
        });
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, topK);
        // Graph expansion
        const seen = new Set(top.map(r => r.chunk.chunk_id));
        const expanded = [...top];
        for (const result of top) {
            for (const relId of result.chunk.relatedIds) {
                if (seen.has(relId)) {
                    continue;
                }
                const neighbour = this.index.get(relId);
                if (!neighbour) {
                    continue;
                }
                const ks = keywordOverlap(qTokens, neighbour.keywords, neighbour.title, neighbour.content);
                const bonus = IMPORTANCE_BONUS[neighbour.importance] ?? 0;
                expanded.push({ chunk: neighbour, score: 0.9 * (ks + bonus), vectorScore: 0, keywordScore: ks, fromGraph: true });
                seen.add(relId);
            }
        }
        expanded.sort((a, b) => b.score - a.score);
        return expanded.slice(0, topK + 3);
    }
}
exports.KnowledgeBase = KnowledgeBase;
// ── Math helpers ─────────────────────────────────────────────────────────────
function norm(v) {
    let s = 0;
    for (const x of v) {
        s += x * x;
    }
    return Math.sqrt(s);
}
function cosineSimilarity(a, b, aNorm) {
    if (a.length !== b.length) {
        return 0;
    }
    let dot = 0, bNorm = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        bNorm += b[i] * b[i];
    }
    const denominator = aNorm * Math.sqrt(bNorm);
    return denominator === 0 ? 0 : dot / denominator;
}
// ── Keyword helpers ───────────────────────────────────────────────────────────
/** Lowercase tokens, strip punctuation, deduplicate. */
function tokenise(text) {
    return new Set(text.toLowerCase().replace(/[^a-z0-9\s_-]/g, ' ').split(/\s+/).filter(t => t.length > 1));
}
/**
 * BM25-inspired keyword overlap: fraction of query tokens found in the
 * chunk's keywords list, title, or (first 300 chars of) content.
 * Returns a value in [0, 1].
 */
function keywordOverlap(qTokens, keywords, title, content) {
    if (qTokens.size === 0) {
        return 0;
    }
    const chunkText = (keywords.join(' ') + ' ' + title + ' ' + content.slice(0, 300)).toLowerCase();
    let matches = 0;
    for (const token of qTokens) {
        if (chunkText.includes(token)) {
            matches++;
        }
    }
    return matches / qTokens.size;
}
//# sourceMappingURL=KnowledgeBase.js.map