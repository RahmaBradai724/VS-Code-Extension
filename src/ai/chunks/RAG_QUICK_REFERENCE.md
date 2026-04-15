# RAG Framework Files - Quick Reference Guide

## File Map

```
RAG Framework (Complete)
├── CORE FILES (Knowledge Base)
│   ├── chunks_unified_structure.json    (45 chunks, structured knowledge)
│   └── RAG_STRUCTURE.md                 (Format definition & standards)
│
├── QUALITY & VALIDATION
│   ├── RAG_SCHEMA.json                  (Enforce structure, types, validation)
│   └── RAG_REDUNDANCY_ANALYSIS.md       (Identify & consolidate duplicates)
│
├── GRAPH & RELATIONSHIPS
│   └── RAG_RELATIONSHIP_GRAPH.json      (Typed relationships, reverse links, dependencies)
│
├── EXECUTION & OPERATIONS
│   └── RAG_EXECUTION_LOGIC.md           (Runtime pipeline, resolution, fallback, error handling)
│
├── IMPLEMENTATION
│   ├── RAG_IMPLEMENTATION.md            (How to use for RAG, search, LLM integration)
│   └── RAG_COMPLETENESS_REPORT.md       (This roadmap & summary)
│
└── THIS FILE
    └── RAG_QUICK_REFERENCE.md           (You are here)
```

---

## File Purposes at a Glance

### 1. **chunks_unified_structure.json** 📚
**What:** The actual knowledge base (45 chunks of MTF configuration knowledge)

**Use when:**
- Searching for MTF configuration information
- Building RAG retrieval corpus
- Training semantic embeddings
- Looking up specific topics

**Key fields:**
```json
{
  "id": "mtf_mappings_001",
  "title": "Mappings Section - Purpose and Overview",
  "category": "MTF Configuration",
  "subcategory": "Mappings - General",
  "section": "Overview",
  "content": "...",
  "summary": "...",
  "tags": [...],
  "importance": "high",
  "relatedIds": [...]
}
```

---

### 2. **RAG_SCHEMA.json** 🔒
**What:** JSON Schema that validates chunk structure

**Use when:**
- Adding new chunks (validate structure)
- Automating chunk creation
- Setting up CI/CD pipeline validation
- Ensuring consistency

**Enforces:**
```
✅ Required fields: id, title, category, content, summary, tags, importance
✅ Type constraints: id must be snake_case, importance must be enum
✅ Length limits: title 5-100 chars, tags 3-5 items
✅ Enum options: subcategory from 19 predefined values
```

**Validation tools:**
```python
# Python example
import jsonschema

schema = json.load(open('RAG_SCHEMA.json'))
chunks = json.load(open('chunks_unified_structure.json'))

for chunk in chunks:
    jsonschema.validate(chunk, schema['definitions']['chunk'])
```

---

### 3. **RAG_RELATIONSHIP_GRAPH.json** 🔗
**What:** Typed relationships between chunks with bidirectional links

**Use when:**
- Building navigation UI (related chunks)
- Creating learning paths (prerequisite order)
- Finding transitive relationships
- LLM context enrichment (auto-include related chunks)

**Contains:**
```json
{
  "relationshipTypes": { ... },      // 7 types: parent, extends, prerequisite, etc.
  "relationships": [ ... ],           // 25+ explicit typed connections
  "reverseLinks": { ... },            // Who references chunk X?
  "dependencyMatrix": { ... }         // Prerequisites for each chunk
}
```

**Query examples:**
```python
# Find prerequisites
prerequisites = graph['dependencyMatrix']['mtf_channels_001']['required_knowledge']
# → ['mtf_structure_001']

# Find reverse references (who needs this?)
referrers = graph['reverseLinks']['mtf_mappings_001']
# → ['mtf_structure_001', 'mtf_channels_001', ...]

# Check relationship type
rel = graph['relationships'][i]  # type: "parent", "extends", "prerequisite", etc.
```

---

### 4. **RAG_REDUNDANCY_ANALYSIS.md** 🧹
**What:** Identifies duplicated content and provides consolidation plan

**Use when:**
- Planning knowledge base improvements
- Consolidating overlapping chunks
- Maintaining documentation quality
- Preparing for chunk updates

**Current status:**
```
HIGH PRIORITY:
  - mtf_mappings_001 vs mtf_mappings_devices (consolidate into 1)
  
MEDIUM PRIORITY:
  - Abstraction scattered across 3 chunks (extract to mtf_abstraction_model)
  - Field docs repeated (centralize in mtf_channels_fields)
```

**Deliverables:**
- 3-phase consolidation plan
- Concrete merge/extract instructions  
- Before/after metrics (15% → 3% redundancy)
- Prevention checklist (monthly audits)

---

### 5. **RAG_EXECUTION_LOGIC.md** ⚙️
**What:** Operational knowledge - how config is processed at runtime

**Use when:**
- Explaining "why" something happens
- Troubleshooting configuration issues
- Understanding resolution order
- Documenting fallback behavior
- Error handling strategies

**Covers 4 phases:**
```
1. Parsing & Validation       (YAML → JSON, schema check)
2. Reference Resolution       (Tracer names → objects)
3. Priority Application       (Explicit > Default > Fallback)
4. Hardware Initialization    (Open connections, validate)
```

**Also defines:**
- Conflict resolution (which device wins?)
- Fallback behavior (missing fields)
- Error handling (CRITICAL/ERROR/WARNING/INFO)
- Initialization sequence (step-by-step)

**9 new chunks needed:**
```
mtf_validation_rules_001
mtf_resolution_order_001
mtf_priority_rules_001
mtf_hardware_initialization_001
mtf_conflict_resolution_001
mtf_fallback_rules_001
mtf_initialization_sequence_001
mtf_error_handling_001
mtf_config_merging_001
```

---

### 6. **RAG_IMPLEMENTATION.md** 🚀
**What:** How to actually use the RAG for search, retrieval, and LLM integration

**Use when:**
- Building search interface
- Implementing LLM context enrichment  
- Optimizing query performance
- Testing RAG effectiveness

**Includes:**
- Query optimization strategies (full-text, semantic, tag-based)
- Search implementation (PostgreSQL, Elasticsearch, Vector DB)
- LLM integration patterns
- Performance metrics & optimization
- Implementation checklist

---

### 7. **RAG_COMPLETENESS_REPORT.md** 📊
**What:** Comprehensive solution report addressing 4 weaknesses

**Use when:**
- Reviewing overall RAG quality
- Getting implementation roadmap
- Understanding all 4 solutions together
- Tracking progress (Phase 1-5)

**Covers:**
- Problem statement for each weakness
- Solution provided (files created)
- Expected outcomes
- Success metrics (60% → 95% effectiveness)

---

### 8. **RAG_STRUCTURE.md** 📋
**What:** Format definition and standards for chunks

**Use when:**
- Creating new chunks (follow template)
- Understanding field definitions
- Reviewing category hierarchy
- Teaching others about the structure

**Defines:**
- Standard chunk format with 14 fields
- Field descriptions (required vs optional)
- Category hierarchy (MTF Config → Channels → ...)
- RAG optimization strategies

---

## Common Workflows

### Workflow 1: Find Information About Topic
```
User: "How do I configure CAN channels?"

1. Open: chunks_unified_structure.json
2. Search: tags includes "CAN" OR content includes "CAN"
3. Found: mtf_channels_001, mtf_cm_mapping
4. Open: RAG_RELATIONSHIP_GRAPH.json
5. Find: relatedIds for each chunk
6. Include: mtf_structure_001 (prerequisite), mtf_mappings_001 (context)
7. Return: Sorted by learning order
```

### Workflow 2: Add New Chunk
```
1. Read: RAG_STRUCTURE.md → Understand format
2. Create: JSON using RAG_SCHEMA.json template
3. Check: Validate against RAG_SCHEMA.json
4. Link: Add relatedIds
5. Update: RAG_RELATIONSHIP_GRAPH.json with new relationships
6. Verify: Run validation script
```

### Workflow 3: Fix Redundancy
```
1. Read: RAG_REDUNDANCY_ANALYSIS.md
2. Identify: Which chunks to consolidate
3. Merge: Content into consolidated chunk
4. Update: relatedIds in affected chunks
5. Remove: Redundant chunk from file
6. Validate: All links still intact
7. Test: Search results unchanged
```

### Workflow 4: Build LLM Context
```
1. User query: "Explain how resolution happens"
2. Semantic search: Find mtf_resolution_order_001
3. Get prerequisites: 
   - From dependency matrix: mtf_structure_001, mtf_channels_001
4. Get extensions:
   - From relatedIds: mtf_validation_rules_001, mtf_conflict_resolution_001
5. Get examples:
   - From reverseLinks: mtf_cm_mapping, mtf_bts_mapping
6. Build context:
   - Sort by learning order (prerequisites first)
   - Include summaries + full content for main chunk
   - Include titles + summaries for related chunks
7. Pass to LLM with prompt
```

---

## File Dependencies

```
chunks_unified_structure.json
    ↑ (must respect)
    └─→ RAG_SCHEMA.json (validates structure)
    
chunks_unified_structure.json
    ↑ (powers)
    ├─→ RAG_RELATIONSHIP_GRAPH.json (indexes)
    └─→ RAG_IMPLEMENTATION.md (how to use)

RAG_STRUCTURE.md
    ↑ (defines format for)
    └─→ chunks_unified_structure.json

RAG_REDUNDANCY_ANALYSIS.md
    ↑ (improves)
    └─→ chunks_unified_structure.json

RAG_EXECUTION_LOGIC.md
    ↑ (adds operational docs, needs)
    └─→ 9 new chunks (to be created)

RAG_COMPLETENESS_REPORT.md
    ↑ (summarizes all)
    └─→ All other files
```

---

## Implementation Checklist

### Week 1: Validation
- [ ] Run schema validator on all chunks
- [ ] Fix any validation errors
- [ ] Setup CI/CD schema check
- [ ] Document validation process

### Week 2: Consolidation
- [ ] Merge mtf_mappings_001 + mtf_mappings_devices
- [ ] Create mtf_abstraction_model
- [ ] Update all relatedIds
- [ ] Test search results unchanged

### Week 3: Graph Enhancement
- [ ] Verify bidirectional reverseLinks
- [ ] Validate dependency matrix
- [ ] Create visualization (optional)
- [ ] Test learning path generation

### Week 4: Execution Logic
- [ ] Create 9 execution chunks
- [ ] Document examples for each
- [ ] Link to main knowledge base
- [ ] Test LLM query patterns

### Week 5: Integration
- [ ] Update RAG retrieval code
- [ ] Implement relationship traversal
- [ ] Test context building
- [ ] Performance tuning

---

## Quick Links to Solutions

**Problem: Content is redundant**
→ See: `RAG_REDUNDANCY_ANALYSIS.md` (has consolidation plan)

**Problem: No validation of chunk structure**
→ See: `RAG_SCHEMA.json` (JSON Schema with constraints)

**Problem: Can't navigate relationships**
→ See: `RAG_RELATIONSHIP_GRAPH.json` (typed graph with reverse links)

**Problem: Don't understand how config works**
→ See: `RAG_EXECUTION_LOGIC.md` (runtime pipeline, fallback, error handling)

**Problem: How do I build an LLM RAG system?**
→ See: `RAG_IMPLEMENTATION.md` (search patterns, integration examples)

---

## FAQ

**Q: Do I need all 8 files?**
A: For basic RAG: chunks_unified_structure.json + RAG_STRUCTURE.md
   For production: Add RAG_SCHEMA.json, RAG_RELATIONSHIP_GRAPH.json, RAG_IMPLEMENTATION.md
   For completeness: Add RAG_EXECUTION_LOGIC.md, RAG_REDUNDANCY_ANALYSIS.md

**Q: Can I use just the chunks file?**
A: Yes, but you'll miss relationships, validation, and operational docs. More error-prone.

**Q: How often to update the graph?**
A: Update RAG_RELATIONSHIP_GRAPH.json whenever chunks are added/removed/consolidated

**Q: Is redundancy elimination urgent?**
A: Medium priority. Consolidate in week 2, but not blocking other work.

**Q: When do I create the 9 execution chunks?**
A: Week 4, after validation and consolidation are done. They're important but not foundational.

---

## Support

- **Schema validation errors?** → Check RAG_SCHEMA.json enum values
- **Relationship questions?** → Check RAG_RELATIONSHIP_GRAPH.json docs
- **How config works?** → Check RAG_EXECUTION_LOGIC.md
- **Building RAG?** → Check RAG_IMPLEMENTATION.md
- **Overall picture?** → Check RAG_COMPLETENESS_REPORT.md

