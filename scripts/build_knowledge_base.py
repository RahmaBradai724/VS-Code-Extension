#!/usr/bin/env python3
"""
MTF Knowledge Base Builder
===========================
Reads the curated chunk file (src/ai/chunks/chunks_final.json), embeds each
chunk via Ollama (nomic-embed-text), and saves the indexed result to
resources/knowledge_base.json.

Embedding strategy
------------------
Each chunk is embedded as:

    {title}
    {content}

Prepending the title gives the embedding model richer semantic context and
improves vector-search recall -- especially for short or dense chunks.

Requirements:
    pip install requests

Usage:
    # 1. Make sure Ollama is running and the model is pulled:
    #       ollama pull nomic-embed-text
    # 2. Run from the repo root:
    #       python scripts/build_knowledge_base.py
"""

import json
import sys
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("ERROR: Install requests first:  pip install requests")
    sys.exit(1)

# -- Paths ----------------------------------------------------------------------
ROOT         = Path(__file__).parent.parent
CHUNKS_PATH  = ROOT / "src" / "ai" / "chunks" / "chunks_final.json"
OUTPUT_PATH  = ROOT / "resources" / "knowledge_base.json"

# -- Ollama --------------------------------------------------------------------
OLLAMA_BASE  = "http://localhost:11434"
EMBED_MODEL  = "nomic-embed-text"

# -- Helpers -------------------------------------------------------------------

def check_ollama() -> None:
    """Verify Ollama is reachable and the embed model is available."""
    try:
        resp = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=5)
        resp.raise_for_status()
        models = [m["name"] for m in resp.json().get("models", [])]
        print(f"  Ollama running -- available models: {models}")
        if not any(EMBED_MODEL in m for m in models):
            print(f"  WARNING: '{EMBED_MODEL}' not found.")
            print(f"           Run:  ollama pull {EMBED_MODEL}")
            sys.exit(1)
    except requests.RequestException as exc:
        print(f"  ERROR: Ollama not reachable at {OLLAMA_BASE} -- {exc}")
        sys.exit(1)


def embed(text: str) -> list[float]:
    """Call Ollama /api/embeddings and return the float vector."""
    resp = requests.post(
        f"{OLLAMA_BASE}/api/embeddings",
        json={"model": EMBED_MODEL, "prompt": text},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["embedding"]


def embed_text_for_chunk(chunk: dict) -> str:
    """
    Build the text to embed for a single chunk.

    Strategy: title + newline + content
    - The title anchors semantic meaning (especially for short or dense chunks).
    - The content provides the full detail for similarity matching.
    - The summary is stored as metadata only (not embedded) to avoid redundancy.
    """
    title   = chunk.get("title", "").strip()
    content = chunk.get("content", "").strip()
    return f"{title}\n{content}" if title else content


# -- Main pipeline -------------------------------------------------------------

def main() -> None:
    print("=" * 60)
    print("MTF Knowledge Base Builder")
    print("=" * 60)

    # Step 1: Check Ollama
    print("\n[1/4] Checking Ollama...")
    check_ollama()

    # Step 2: Load chunks
    print(f"\n[2/4] Loading chunks from {CHUNKS_PATH.relative_to(ROOT)}...")
    if not CHUNKS_PATH.exists():
        print(f"  ERROR: {CHUNKS_PATH} not found.")
        sys.exit(1)

    chunks: list[dict] = json.loads(CHUNKS_PATH.read_text(encoding="utf-8"))
    print(f"  Loaded {len(chunks)} chunks")
    print(f"  Fields per chunk: {list(chunks[0].keys())}")

    # Step 3: Embed
    print(f"\n[3/4] Embedding {len(chunks)} chunks with '{EMBED_MODEL}'...")
    print("  (embedding text = title + content)")

    failed  = 0
    indexed = []

    for i, chunk in enumerate(chunks):
        embed_input = embed_text_for_chunk(chunk)
        try:
            vector = embed(embed_input)
        except Exception as exc:
            print(f"  [{i+1}/{len(chunks)}] FAILED -- {exc}")
            vector = []
            failed += 1

        # Build the indexed record: all original metadata + the embedding vector
        indexed.append({
            "chunk_id":   chunk["chunk_id"],
            "section":    chunk["section"],
            "subsection": chunk["subsection"],
            "title":      chunk["title"],
            "content":    chunk["content"],
            "summary":    chunk.get("summary", ""),
            "importance": chunk.get("importance", "medium"),
            "keywords":   chunk.get("keywords", []),
            "source_url": chunk.get("source_url", ""),
            "relatedIds": chunk.get("relatedIds", []),
            "embedding":  vector,
        })

        if (i + 1) % 5 == 0 or i == len(chunks) - 1:
            dim = len(vector) if vector else 0
            print(f"  [{i+1}/{len(chunks)}] OK  dim={dim}")

        # Small delay to avoid hammering Ollama
        time.sleep(0.05)

    if failed:
        print(f"\n  WARNING: {failed} chunk(s) failed to embed -- saved with empty vectors")

    # Step 4: Save
    print(f"\n[4/4] Saving knowledge base...")
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    embed_dim = len(indexed[0]["embedding"]) if indexed and indexed[0]["embedding"] else 0

    kb = {
        "model":       EMBED_MODEL,
        "embed_dim":   embed_dim,
        "created_at":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "chunk_count": len(indexed),
        "chunks":      indexed,
    }

    OUTPUT_PATH.write_text(json.dumps(kb, indent=2, ensure_ascii=False), encoding="utf-8")

    print(f"\nSaved {len(indexed)} indexed chunks -> {OUTPUT_PATH.relative_to(ROOT)}")
    print(f"  embed_dim  : {embed_dim}")
    print(f"  model      : {EMBED_MODEL}")
    if failed:
        print(f"  failed     : {failed}")
    print("\nNext step: implement hybrid retrieval (vector + keyword search) on this index.")


if __name__ == "__main__":
    main()
