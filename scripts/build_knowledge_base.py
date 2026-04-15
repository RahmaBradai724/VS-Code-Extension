#!/usr/bin/env python3
"""
MTF Knowledge Base Builder
===========================
Scrapes the MTF Configuration File documentation, chunks it, embeds each chunk
via Ollama (nomic-embed-text), and saves the result to resources/knowledge_base.json.

Requirements:
    pip install requests beautifulsoup4

Usage:
    # Make sure Ollama is running and has nomic-embed-text pulled:
    #   ollama pull nomic-embed-text
    python scripts/build_knowledge_base.py
"""

import json
import re
import sys
import time
from pathlib import Path
from typing import Generator

try:
    import requests
    from bs4 import BeautifulSoup, Tag
except ImportError:
    print("ERROR: Install dependencies first:  pip install requests beautifulsoup4")
    sys.exit(1)

# ── Configuration ─────────────────────────────────────────────────────────────

DOC_URL = (
    "https://files.technica-engineering.de/MTF/Documentation/"
    "MTF_1.38.0_documentation/source/common_files_for_documentation/"
    "rst%20files/MTF_Configuration_File.html"
)
OLLAMA_BASE = "http://localhost:11434"
EMBED_MODEL = "nomic-embed-text"
CHUNK_SIZE  = 500   # approximate tokens (chars / 4)
CHUNK_OVERLAP = 80  # token overlap between consecutive chunks

OUTPUT_PATH = Path(__file__).parent.parent / "resources" / "knowledge_base.json"

# ── Helpers ───────────────────────────────────────────────────────────────────

def approx_tokens(text: str) -> int:
    return len(text) // 4


def chunk_text(text: str, size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks preserving word boundaries."""
    words = text.split()
    chunks: list[str] = []
    step = max(1, size - overlap)
    i = 0
    while i < len(words):
        chunk_words = words[i : i + size]
        chunk = " ".join(chunk_words).strip()
        if chunk:
            chunks.append(chunk)
        if i + size >= len(words):
            break
        i += step
    return chunks


def embed(text: str) -> list[float]:
    """Call Ollama /api/embeddings and return the embedding vector."""
    resp = requests.post(
        f"{OLLAMA_BASE}/api/embeddings",
        json={"model": EMBED_MODEL, "prompt": text},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["embedding"]


# ── Scraping ──────────────────────────────────────────────────────────────────

def fetch_html(url: str) -> BeautifulSoup:
    print(f"Fetching documentation from: {url}")
    headers = {"User-Agent": "MTF-KB-Builder/1.0"}
    resp = requests.get(url, headers=headers, timeout=30)
    resp.raise_for_status()
    print(f"  Response: {resp.status_code}, {len(resp.content)} bytes")
    return BeautifulSoup(resp.text, "html.parser")


def iter_sections(soup: BeautifulSoup) -> Generator[dict, None, None]:
    """
    Walk the document and yield dicts:
      {section, subsection, content}

    Strategy: find all heading elements (h1-h4) and collect text until
    the next heading of the same or higher level.
    """
    body = soup.find("body") or soup
    headings = body.find_all(re.compile(r"^h[1-4]$"))

    def heading_level(tag: Tag) -> int:
        return int(tag.name[1])

    current: dict = {"section": "MTF Configuration File", "subsection": "", "lines": []}

    for idx, heading in enumerate(headings):
        level = heading_level(heading)
        title = heading.get_text(" ", strip=True)

        # Collect all sibling elements until the next heading
        sibling_texts: list[str] = []
        for sib in heading.next_siblings:
            if hasattr(sib, "name") and sib.name and re.match(r"^h[1-4]$", sib.name):
                break
            t = sib.get_text(" ", strip=True) if hasattr(sib, "get_text") else str(sib).strip()
            if t:
                sibling_texts.append(t)

        block_text = " ".join(sibling_texts).strip()

        if level == 1:
            if current["lines"]:
                yield current
            current = {"section": title, "subsection": "", "lines": [block_text]}
        elif level == 2:
            if current["lines"]:
                yield current
            current = {"section": current["section"] or title, "subsection": title, "lines": [block_text]}
        else:
            # h3/h4 — append to current subsection
            current["lines"].append(f"[{title}] {block_text}")

    if current["lines"]:
        yield current


def build_records(soup: BeautifulSoup) -> list[dict]:
    """Return flat list of {section, subsection, text} ready for chunking."""
    records: list[dict] = []
    for sec in iter_sections(soup):
        combined = "\n".join(line for line in sec["lines"] if line)
        if len(combined.strip()) < 30:
            continue
        records.append({
            "section": sec["section"],
            "subsection": sec["subsection"],
            "text": combined,
        })
    return records


# ── Main pipeline ─────────────────────────────────────────────────────────────

def check_ollama():
    try:
        resp = requests.get(f"{OLLAMA_BASE}/api/tags", timeout=5)
        models = [m["name"] for m in resp.json().get("models", [])]
        print(f"  Ollama running — models: {models}")
        # Check if nomic-embed-text is available (allow version suffixes)
        if not any(EMBED_MODEL in m for m in models):
            print(f"  WARNING: '{EMBED_MODEL}' not found. Run:  ollama pull {EMBED_MODEL}")
    except Exception as exc:
        print(f"  ERROR: Ollama not reachable at {OLLAMA_BASE} — {exc}")
        sys.exit(1)


def main():
    print("=" * 60)
    print("MTF Knowledge Base Builder")
    print("=" * 60)

    # 1. Check Ollama
    print("\n[1/4] Checking Ollama...")
    check_ollama()

    # 2. Fetch and parse documentation
    print("\n[2/4] Fetching MTF documentation...")
    soup = fetch_html(DOC_URL)
    records = build_records(soup)
    print(f"  Found {len(records)} sections/subsections")

    # 3. Chunk
    print("\n[3/4] Chunking...")
    chunks: list[dict] = []
    chunk_id = 0
    for rec in records:
        text_chunks = chunk_text(rec["text"])
        for chunk_text_content in text_chunks:
            if approx_tokens(chunk_text_content) < 10:
                continue
            chunks.append({
                "id": chunk_id,
                "text": chunk_text_content,
                "metadata": {
                    "section":    rec["section"],
                    "subsection": rec["subsection"],
                    "source":     "MTF_Configuration_File.html",
                },
                "embedding": [],  # filled in step 4
            })
            chunk_id += 1

    print(f"  Created {len(chunks)} chunks")

    # 4. Embed
    print(f"\n[4/4] Embedding {len(chunks)} chunks with '{EMBED_MODEL}'...")
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)

    failed = 0
    for i, chunk in enumerate(chunks):
        try:
            emb = embed(chunk["text"])
            chunk["embedding"] = emb
            if (i + 1) % 10 == 0 or i == len(chunks) - 1:
                print(f"  [{i+1}/{len(chunks)}] embedded ✓  (dim={len(emb)})")
        except Exception as exc:
            print(f"  [{i+1}/{len(chunks)}] FAILED — {exc}")
            failed += 1
        # Small delay to avoid hammering Ollama
        time.sleep(0.05)

    if failed:
        print(f"\n  WARNING: {failed} chunks failed to embed — they are saved with empty embeddings")

    # 5. Save
    kb = {
        "model":       EMBED_MODEL,
        "embed_dim":   len(chunks[0]["embedding"]) if chunks else 0,
        "created_at":  time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "chunk_count": len(chunks),
        "chunks":      chunks,
    }

    OUTPUT_PATH.write_text(json.dumps(kb, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"\n✓ Saved {len(chunks)} chunks → {OUTPUT_PATH}")
    print("  Run the VS Code extension and open the MTF Agent panel to use it.")


if __name__ == "__main__":
    main()
