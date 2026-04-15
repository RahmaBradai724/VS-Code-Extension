"use strict";
/**
 * KnowledgeBase — loads resources/knowledge_base.json and provides
 * cosine-similarity search over pre-computed embeddings.
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
class KnowledgeBase {
    constructor(chunks) {
        this.chunks = chunks;
    }
    // ── Factory ─────────────────────────────────────────────────────────────
    /**
     * Load the knowledge base from the extension's `resources/` directory.
     * Throws if the file doesn't exist.
     */
    static load(resourcesDir) {
        const kbPath = path.join(resourcesDir, 'knowledge_base.json');
        if (!fs.existsSync(kbPath)) {
            throw new Error(`Knowledge base not found at ${kbPath}.\n` +
                'Run:  python scripts/build_knowledge_base.py');
        }
        const raw = fs.readFileSync(kbPath, 'utf-8');
        const kb = JSON.parse(raw);
        // Filter out any chunks with empty embeddings (build failures)
        const valid = kb.chunks.filter(c => c.embedding && c.embedding.length > 0);
        return new KnowledgeBase(valid);
    }
    /** Total number of indexed chunks. */
    get size() {
        return this.chunks.length;
    }
    // ── Search ──────────────────────────────────────────────────────────────
    /**
     * Return the `topK` most relevant chunks for a given query embedding.
     * Uses normalised cosine similarity.
     */
    search(queryEmbedding, topK = 5) {
        const qNorm = norm(queryEmbedding);
        if (qNorm === 0) {
            return [];
        }
        const scored = this.chunks.map(chunk => ({
            chunk,
            score: cosineSimilarity(queryEmbedding, chunk.embedding, qNorm),
        }));
        scored.sort((a, b) => b.score - a.score);
        return scored.slice(0, topK);
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
//# sourceMappingURL=KnowledgeBase.js.map