# RAG Implementation Guide for MTF Knowledge Base

## Overview

This guide explains how to organize and utilize the unified RAG (Retrieval-Augmented Generation) structure for the MTF configuration knowledge base. The structure is designed for optimal performance with LLMs and semantic search systems.

## File Organization

```
knowledge_base/
├── chunks.json                      # Original flat structure (reference)
├── chunks_unified_structure.json    # New unified structure
├── RAG_STRUCTURE.md                 # Structure definition
├── RAG_IMPLEMENTATION.md            # This file
└── metadata/
    ├── index.json                   # Master index
    ├── categories.json              # Category mapping
    └── relationships.json           # Chunk relationships
```

## Unified Structure Benefits

### 1. **Enhanced Retrieval**
- **Full-text search**: Search across title, content, tags, keywords
- **Semantic search**: Embeddings from summary and title provide semantic context
- **Category filtering**: Quick filtering by domain area
- **Tag-based search**: Fast lookup by topic tags
- **Relationship traversal**: `relatedIds` enables context-aware retrieval

### 2. **Better Context For LLMs**
- **Summary field**: 1-3 sentences provide condensed semantic representation
- **Hierarchical organization**: Category → Subcategory → Section enables structured context
- **Related chunks**: LLM can automatically include related content
- **Examples field**: Concrete examples improve understanding
- **Importance scores**: Rank results by relevance

### 3. **Scalability**
- **Metadata separation**: Categories and relationships in separate files reduce redundancy
- **Versioning support**: `lastUpdated` field tracks modifications
- **Modular updates**: Easy to add new chunks without restructuring
- **Performance optimization**: Index files enable fast lookups

## Chunk Structure Breakdown

### Required Fields (Always Include)
```json
{
  "id": "mtf_channels_001",              // Unique identifier
  "title": "Channel Naming Rules",       // Clear description
  "category": "MTF Configuration",       // Main topic
  "content": "Full detailed content...", // Complete information
  "summary": "Brief 1-3 sentence...",    // Condensed version
  "tags": ["tag1", "tag2", "tag3"],      // Search keywords
  "importance": "high"                   // Priority level
}
```

### Optional Fields (Enhance Retrieval)
```json
{
  "subcategory": "Channels",              // Sub-topic
  "section": "Naming",                    // Logical section
  "relatedIds": ["chunk_id1", "chunk_id2"], // Related chunks
  "keywords": ["alternative", "terms"],   // Search synonyms
  "examples": ["can_ch1", "eth_main"],    // Real-world examples
  "lastUpdated": "2026-04-14",            // Version tracking
  "source": "MTF Configuration Guide"     // Reference source
}
```

## Query Optimization Strategies

### 1. Full-Text Search Query
```
User: "How do I configure CAN channels?"

Search targets:
- title: "Channel Configuration Fields" ✓
- content: "CAN configuration..." ✓
- tags: ["CAN", "channels"] ✓
- keywords: ["configuration", "setup"] ✓
```

### 2. Semantic Search Query
```
User: "What are the best practices for naming channels?"

Process:
1. Generate embedding from user query
2. Compare against chunk summaries (fast, semantic)
3. Find similar: "Channel names must be unique, meaningful..."
4. Return mtf_channels_naming chunk
5. Auto-include related: mtf_channels_001, mtf_channels_fields
```

### 3. Category-Based Discovery
```
User: "Show me all Mappings configuration"

Search:
- category == "MTF Configuration"
- subcategory == "Mappings"
Returns: [mtf_mappings_001, mtf_cm_mapping, mtf_bts_mapping, ...]
```

### 4. Tag-Based Filtering
```
User: "Find all hardware device documentation"

Search:
- tags includes "hardware"
- importance >= "medium"
Returns: All hardware-related chunks ranked by importance
```

## Implementation Checklist

### For Knowledge Base Teams
- [ ] Audit all existing chunks for consistency
- [ ] Add missing fields (summary, keywords, relatedIds)
- [ ] Update category/subcategory to match hierarchy
- [ ] Add concrete examples for each chunk
- [ ] Set appropriate importance levels
- [ ] Create relationships between related chunks
- [ ] Generate metadata index files
- [ ] Test semantic search embeddings

### For RAG System Integration
- [ ] Configure full-text search on: title, content, tags, keywords
- [ ] Setup semantic search on: summary, title
- [ ] Implement category filtering UI
- [ ] Add relationship traversal (follow relatedIds)
- [ ] Create importance-based ranking
- [ ] Setup versioning via lastUpdated
- [ ] Implement chunk preview (title + summary)

### For LLM Integration
- [ ] Pass summary + relatedIds to LLM context
- [ ] Include up to 3 related chunks in context window
- [ ] Filter by importance=high for concise contexts
- [ ] Use examples field for concrete illustrations
- [ ] Leverage source field for citations

## Example RAG Workflows

### Workflow 1: Quick Question Answering
```
1. User: "What is BTS-REVO?"
2. Full-text search: tags:"BTS" OR title:"BTS"
3. Return: mtf_bts_mapping (importance: high)
4. LLM gets: mtf_bts_mapping.summary + content
5. Result: Quick, accurate answer
```

### Workflow 2: In-Depth Context
```
1. User: "How do I set up a complete test configuration?"
2. Semantic search: Embed user query
3. Find: mtf_structure_001 (top match)
4. Follow relatedIds: mtf_channels_001 → mtf_mappings_001 → mtf_framework_001
5. LLM gets full context: All 4 chunks with relationships
6. Result: Comprehensive guide with structured information
```

### Workflow 3: Troubleshooting
```
1. User: "My channels aren't being recognized"
2. Tag search: "naming" OR "case-sensitive"
3. Find: mtf_channels_naming (importance: high)
4. Include related: mtf_channels_fields
5. LLM diagnoses: Case sensitivity or naming rule violation
6. Result: Specific troubleshooting advice with examples
```

## Metadata Files

### index.json
```json
{
  "totalChunks": 45,
  "lastUpdate": "2026-04-14",
  "categories": [
    "MTF Configuration",
    "Hardware Mappings",
    "Framework Configuration"
  ],
  "allIds": ["mtf_overview_001", "mtf_overview_002", ...]
}
```

### categories.json
```json
{
  "MTF Configuration": {
    "count": 25,
    "subcategories": {
      "Overview": 2,
      "Channels": 5,
      "Mappings": 10,
      "FrameworkConfig": 8
    }
  },
  "...": {}
}
```

### relationships.json
```json
{
  "mtf_overview_001": {
    "relatedTo": ["mtf_structure_001", "mtf_channels_001"],
    "references": ["MTF framework", "configuration"],
    "referencedBy": ["mtf_mappings_001"]
  },
  "...": {}
}
```

## Migration from Old Structure

### Steps:
1. Keep original chunks.json as backup
2. Create new chunks_unified_structure.json
3. Update application to read unified structure
4. Add metadata files alongside
5. Test full-text and semantic search
6. Verify all relatedIds point to valid chunks
7. Gradually migrate remaining chunks

### Validation Script Checklist:
```python
def validate_chunks(chunks):
    for chunk in chunks:
        assert chunk.get('id'), "Missing id"
        assert chunk.get('title'), "Missing title"
        assert chunk.get('category'), "Missing category"
        assert chunk.get('content'), "Missing content"
        assert chunk.get('summary'), "Missing summary"
        assert chunk.get('tags'), "Missing tags"
        assert chunk.get('importance') in ['high', 'medium', 'low']
        
        # Validate relationships
        for related_id in chunk.get('relatedIds', []):
            assert id_exists(related_id), f"Invalid relatedId: {related_id}"
        
        # Validate tags (3-5 items)
        assert 3 <= len(chunk['tags']) <= 5
        
        # Validate summary (1-3 sentences)
        sentences = chunk['summary'].count('.') + chunk['summary'].count('?')
        assert 1 <= sentences <= 3
```

## Search Implementation Examples

### PostgreSQL Full-Text Search
```sql
SELECT * FROM chunks 
WHERE 
  to_tsvector('english', title || ' ' || content || ' ' || array_to_string(tags, ' ')) 
  @@ plainto_tsquery('english', 'channel naming')
ORDER BY importance DESC
LIMIT 10;
```

### Elasticsearch Query
```json
{
  "query": {
    "multi_match": {
      "query": "channel naming",
      "fields": ["title^3", "summary^2", "content", "tags", "keywords"],
      "fuzziness": "AUTO"
    }
  },
  "sort": [
    {"importance": {"order": "desc"}},
    {"_score": {"order": "desc"}}
  ]
}
```

### Vector Database (Pinecone, Weaviate)
```python
# Generate embedding from summary + title
embedding = embedder.encode(f"{chunk['title']}. {chunk['summary']}")

# Store with metadata
vector_db.upsert(
    id=chunk['id'],
    vector=embedding,
    metadata={
        'category': chunk['category'],
        'importance': chunk['importance'],
        'tags': chunk['tags']
    },
    text=chunk['summary']  # For hybrid search
)
```

## Performance Metrics

### Target Metrics:
- Full-text search: < 100ms for 1000 chunks
- Semantic search: < 200ms (embedding generation)
- Category filter: < 50ms
- Relationship traversal: < 10ms per hop
- LLM context build: < 500ms for 5 chunks

### Optimization Tips:
1. Use indexes on: id, category, tags
2. Denormalize frequently accessed fields
3. Cache frequently asked questions
4. Use vector database for semantic search
5. Batch similarity searches
6. Implement pagination for large result sets

## Maintenance Guidelines

### Weekly:
- [ ] Review new chunks for completeness
- [ ] Verify no orphaned relatedIds
- [ ] Update lastUpdated for modified chunks

### Monthly:
- [ ] Audit tag consistency
- [ ] Review similar chunks for consolidation
- [ ] Update category statistics
- [ ] Refresh metadata indexes

### Quarterly:
- [ ] Full knowledge base review
- [ ] Add missing chunks identified from queries
- [ ] Reorganize categories if needed
- [ ] Update example content

## Troubleshooting

### Issue: Related chunks not found
**Solution**: Verify relatedIds exist in current chunk set

### Issue: Inconsistent categories
**Solution**: Run category validation script, standardize naming

### Issue: Search results too broad
**Solution**: Add more specific tags, use importance filtering

### Issue: Semantic search low quality
**Solution**: Improve summary field (more descriptive), add keywords

## Next Steps

1. **Immediate**: Deploy unified structure alongside existing system
2. **Week 1**: Add metadata files and validation scripts
3. **Week 2**: Implement enhanced search UI
4. **Week 3**: Complete migration of remaining chunks
5. **Week 4**: Performance optimization and testing
