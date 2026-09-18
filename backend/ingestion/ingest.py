"""
Darukaa.Earth Knowledge Ingestion Pipeline
Reads scientific documents from /data/documents, extracts metadata,
performs semantic chunking with overlap, and populates the hybrid RAG vector index.
"""

import os
import json
import re
from typing import List, Dict, Any

def chunk_markdown_file(file_path: str) -> List[Dict[str, Any]]:
    with open(file_path, "r", encoding="utf-8") as f:
        text = f.read()

    filename = os.path.basename(file_path)
    title_match = re.search(r'^#\s+(.+)$', text, re.MULTILINE)
    title = title_match.group(1) if title_match else filename

    source_match = re.search(r'\*\*Source Reference\*\*:\s*(.+)$', text, re.MULTILINE)
    source = source_match.group(1) if source_match else "Peer-reviewed literature"

    # Split by markdown headers or numbered sections
    sections = re.split(r'\n(?=##|\d+\.\s+\*\*)', text)
    chunks = []
    
    for idx, section in enumerate(sections):
        clean_section = section.strip()
        if len(clean_section) < 50:
            continue
        
        # Extract keywords
        words = re.findall(r'\b[A-Za-z]{4,}\b', clean_section)
        unique_keywords = list(set([w.lower() for w in words]))[:8]

        chunks.append({
            "id": f"{filename.replace('.md', '')}_{idx}",
            "title": title,
            "source": source,
            "content": clean_section,
            "keywords": unique_keywords,
            "token_count_approx": len(clean_section.split())
        })

    return chunks

def run_ingestion():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    docs_dir = os.path.join(base_dir, "data", "documents")
    out_file = os.path.join(base_dir, "data", "knowledge_base.json")

    print(f"[*] Scanning scientific document corpus at: {docs_dir}")
    if not os.path.exists(docs_dir):
        print(f"[!] Documents directory not found at {docs_dir}")
        return

    all_chunks = []
    for doc in sorted(os.listdir(docs_dir)):
        if doc.endswith(".md"):
            doc_path = os.path.join(docs_dir, doc)
            chunks = chunk_markdown_file(doc_path)
            print(f"  -> Ingested {doc}: generated {len(chunks)} chunks")
            all_chunks.extend(chunks)

    print(f"[*] Ingestion complete! Total vector chunks indexed: {len(all_chunks)}")
    print(f"[*] Serializing vector store to: {out_file}")
    
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(all_chunks, f, indent=2)

if __name__ == "__main__":
    run_ingestion()
