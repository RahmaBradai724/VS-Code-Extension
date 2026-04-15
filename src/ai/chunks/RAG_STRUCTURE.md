# Unified RAG Structure for Knowledge Base

## Standard Chunk Format

Use this JSON structure consistently across all knowledge base files:

```json
{
  "id": "unique_identifier",
  "title": "Human-readable title",
  "category": "main_category",
  "subcategory": "sub_category",
  "section": "logical_section",
  "content": "Detailed content describing the topic",
  "summary": "2-3 sentence brief summary",
  "tags": ["tag1", "tag2", "tag3"],
  "importance": "high|medium|low",
  "relatedIds": ["chunk_id1", "chunk_id2"],
  "keywords": ["keyword1", "keyword2"],
  "examples": ["example1", "example2"],
  "lastUpdated": "YYYY-MM-DD",
  "source": "source_file_or_section"
}
```

## Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique identifier (e.g., `chunk_1`, `mtf_config_001`) |
| `title` | string | Yes | Clear, descriptive title (3-10 words) |
| `category` | string | Yes | Main topic area (e.g., "MTF", "Configuration", "Hardware") |
| `subcategory` | string | No | Sub-topic for better organization |
| `section` | string | No | Logical section within category (e.g., "Overview", "Channels", "Mappings") |
| `content` | string | Yes | Full content (100-500 words, detailed) |
| `summary` | string | Yes | Brief 1-3 sentence summary for quick reference |
| `tags` | array | Yes | 3-5 searchable tags for filtering |
| `importance` | string | Yes | Priority level: `high`, `medium`, `low` |
| `relatedIds` | array | No | IDs of related chunks for context linking |
| `keywords` | array | No | Alternative search terms/synonyms |
| `examples` | array | No | Real-world examples mentioned in content |
| `lastUpdated` | string | No | Update date for versioning (YYYY-MM-DD) |
| `source` | string | No | Reference to source document or file section |

## Category Hierarchy

```
MTF Configuration
├── General (Overview, Structure, Performance)
├── Channels
│   ├── Introduction
│   ├── Naming & Best Practices
│   ├── Fields & Properties
│   └── AUTOSAR Integration
├── Mappings - General (Overview, Device Types)
├── Mappings - CM (Capture Module)
├── Mappings - BTS (BTS-REVO)
├── Mappings - PCAP (Network Adapters)
├── Mappings - Power Supply
├── Mappings - Serial
├── Mappings - Relay
├── Mappings - HH Load
├── FrameworkConfig (Overview)
├── FrameworkConfig - Tracers
├── FrameworkConfig - ECUs
├── FrameworkConfig - Publisher
├── FrameworkConfig - Ethernet
├── FrameworkConfig - Diagnostics
├── FrameworkConfig - Fault Injection
├── FrameworkConfig - Time Sync
└── FrameworkConfig - Special Devices
```

## Example Complete Chunk

```json
{
  "id": "mtf_channels_001",
  "title": "Channels Section Purpose and Definition",
  "category": "MTF Configuration",
  "subcategory": "Channels",
  "section": "Overview",
  "content": "The Channels section in YAML format defines all logical channels that represent virtual abstractions of physical hardware interfaces. These logical channels serve as the bridge between test cases and physical hardware. Each channel must have a unique identifier (Id), a communication type (Type), and optional fields like Protocol, TracerName, and LoggingName. Channel names should be meaningful and follow naming conventions without spaces or special characters. The framework uses these logical channels to maintain test portability across different hardware setups by allowing physical mappings to change while keeping test logic unchanged.",
  "summary": "Channels section defines logical channel abstractions that map to physical hardware interfaces, enabling portable test configurations.",
  "tags": ["channels", "logical", "yaml", "hardware", "configuration"],
  "importance": "high",
  "relatedIds": ["mtf_mappings_001", "mtf_channel_fields_001"],
  "keywords": ["channel definition", "logical interface", "hardware abstraction"],
  "examples": ["can_ch1", "eth_main", "lin_comms"],
  "lastUpdated": "2026-04-14",
  "source": "MTF_YAML_Configuration_Guide"
}
```

## RAG Query Optimization

### For Full-Text Search:
- **Include in content**: All contextual information, constraints, and detailed explanations
- **Use tags**: For quick filtering by domain area
- **Use keywords**: For alternative phrasings and terminology

### For Semantic Search:
- **summary field**: Provides condensed semantic representation
- **title + summary**: Forms the basis for embedding generation
- **content**: Full context for LLM-based retrieval

### For Ranking:
- **importance**: Prioritize high/medium over low in results
- **tags/category**: Boost relevance for topic-specific queries
- **relatedIds**: Enable transitive relevance

## Implementation Guidelines

1. **Consistency**: Every chunk must follow the complete structure
2. **Content Quality**: Ensure content is complete, accurate, and well-organized
3. **Metadata**: Always include title, category, tags, and importance
4. **Relationships**: Use `relatedIds` to link conceptually connected chunks
5. **Search Terms**: Include both formal and informal keywords
6. **Examples**: Provide concrete examples when applicable
7. **Updates**: Maintain `lastUpdated` field for version control

## File Organization

All knowledge base files should follow this structure:

```
knowledge_base/
├── mtf_configuration.json      # Main MTF config chunks
├── hardware_mappings.json      # Hardware device mappings
├── framework_config.json       # Framework configuration
├── examples.json               # Configuration examples
├── best_practices.json         # Best practices and patterns
├── troubleshooting.json        # Common issues and solutions
└── index.json                  # Master index with all IDs
```

## Sample Chunk Array Structure

```json
[
  {
    "id": "chunk_1",
    "title": "...",
    "category": "...",
    ...
  },
  {
    "id": "chunk_2",
    "title": "...",
    "category": "...",
    ...
  }
]
```
