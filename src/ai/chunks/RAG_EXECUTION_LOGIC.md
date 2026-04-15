# RAG Execution Logic Layer

## Overview

The "execution logic layer" describes how MTF configuration is **processed at runtime** - not just defined statically. This is critical for understanding:
- **Resolution order:** Which configuration wins when conflicts exist
- **Priority rules:** How defaults are applied
- **Fallback behavior:** What happens when fields are missing
- **Dependency resolution:** Order in which components are activated
- **Conflict resolution:** How to handle ambiguous or contradictory configs

---

## Resolution Pipeline

### Phase 1: Parsing & Validation
```
Raw YAML File
    ↓
YAML Parser (respects indentation, types)
    ↓
Validate against schema (RAG_SCHEMA.json)
    ↓
Type checking (string, enum, list)
    ↓
Required field validation
    ↓
PARSED_CONFIG (JSON object)
```

**Missing chunk:** Create `mtf_validation_rules_001`

### Phase 2: Reference Resolution  
```
PARSED_CONFIG with forward references (e.g., "TracerName: pcap_main")
    ↓
Resolve: "pcap_main" → Tracer object in FrameworkConfig.Tracers
    ↓
Verify: Tracer exists, type matches expected
    ↓
Create bidirectional links: Channel ←→ Tracer
    ↓
RESOLVED_CONFIG (cross-references validated)
```

**Example:**
```yaml
Channels:
  can_ch1:
    Id: can_ch1
    Type: CAN
    TracerName: pcap_main  ← Reference to resolver

FrameworkConfig:
  Tracers:
    pcap_main:            ← Must exist for resolution to succeed
      Type: PCAP
      ...
```

**Missing chunk:** Create `mtf_resolution_order_001`

### Phase 3: Priority Application
```
RESOLVED_CONFIG with explicit settings
    ↓
Apply defaults for missing optional fields
    ↓
Apply precedence rules (command-line > config > defaults)
    ↓
Apply fallback rules (if primary missing, use secondary)
    ↓
RUNTIME_CONFIG (fully resolved, no unknowns)
```

**Missing chunk:** Create `mtf_priority_rules_001`

### Phase 4: Hardware Initialization
```
RUNTIME_CONFIG specifies mapping, e.g. "can_ch1" → "CM at 192.168.1.10, HW channel 1"
    ↓
Load hardware module CM (Capture Module)
    ↓
Open TCP connection to 192.168.1.10
    ↓
Query hardware capabilities
    ↓
Validate requested channel (HWChannel: 1) exists on device
    ↓
Apply OperationMode (Normal/Spy/TxOnly/RxOnly)
    ↓
INITIALIZED_HARDWARE (ready to test)
```

**Missing chunk:** Create `mtf_hardware_initialization_001`

---

## Priority & Precedence Rules

### Rule 1: Explicit > Default > Fallback

**Example: Channel Logging**

```
Priority order:
  1. Explicit: LoggingBusIndex = 5 (user specified)
  2. Default: If missing, use channel number = 1
  3. Fallback: If all fail, use error fallback = 0
```

**Implementation:**
```python
def resolve_logging_index(channel):
    if channel.get('LoggingBusIndex') is not None:
        return channel['LoggingBusIndex']  # Explicit wins
    else:
        return channel.get('LoggingIndex', 1)  # Default to 1
```

### Rule 2: Local > Global > System Default

**Example: Tracer Configuration**

```
Priority for output file location:
  1. Local (Tracer field): FileConfig.BaseFileName = "my_test.pcap"
  2. Global (FrameworkConfig): GlobalLogDir = "C:\test_logs\"
  3. System: Default = ".\logs\"
```

### Rule 3: Specific > Generic > None

**Example: VLAN Tagging**

```
For Ethernet channel:
  1. Specific: Channel-level VLAN = 100 (for this channel only)
  2. Generic: ECU-level VLAN = 200 (all channels for this ECU)
  3. None: No VLAN tagging
```

---

## Conflict Resolution

### Conflict Type 1: Mapping Collision

**Problem:**
```yaml
Mappings:
  CM:
    Device1:
      Buses: [can_ch1, can_ch2]   # Device 1 claims can_ch1
  BTS:
    Board1:
      IOs:
        - ChannelName: can_ch1    # BTS also claims can_ch1
```

**Resolution:**
```
Priority: Defined mapping order (first wins) OR explicit priority field
Error: If ambiguous, raise ConfigurationError
Solution: User must explicitly assign to single hardware
```

**Missing chunk:** Create `mtf_conflict_resolution_001`

### Conflict Type 2: OperationMode Mismatch

**Problem:**
```yaml
Channels:
  can_primary:
    Type: CAN
    
Mappings:
  CM:
    Device1:
      Buses: 
        - Name: can_primary
          OperationMode: Spy       # Listen only
          
Test Case:
  can_primary.send(Frame)          # Tries to send!
```

**Resolution:**
```
Detection: Framework checks capability vs. usage
Error: RuntimeError - "Channel 'can_primary' in Spy mode cannot send"
Prevention: Validate channel mode matches usage in tests
```

### Conflict Type 3: Port Number Conflict

**Problem:**
```yaml
FrameworkConfig:
  AppLayerPorts:
    NPdu: [20000, 21000]
    SomeIP: [20500, 21500]   # Overlaps with NPdu!
```

**Resolution:**
```
Detection: Check for port range overlaps during initialization
Error: PortRangeError - "SomeIP range overlaps with NPdu"
Solution: Adjust ranges or fail startup with clear error
```

---

## Fallback Behavior

### Fallback 1: Missing Tracer Name

```python
def get_tracer_for_channel(channel_name):
    if channel.get('TracerName'):
        return tracers[channel['TracerName']]
    elif channel['Type'] == 'CAN':
        return tracers.get('default_can_tracer')  # Fallback
    elif channel['Type'] == 'ETHERNET':
        return tracers.get('default_eth_tracer')  # Fallback
    else:
        return None  # No logging
```

**Missing chunk:** Create `mtf_fallback_rules_001`

### Fallback 2: Missing Power Supply Channel

```
If logical channel PS_ch1 not mapped to any power supply:
  → Warning: "Channel PS_ch1 has no hardware mapping"
  → Behavior: Skip power delivery for this channel
  → Assumption: ECU receives power from elsewhere
  → Risk: Test may fail if power sensitive
```

### Fallback 3: Missing Diagnostics Config

```
If diagnostics not configured in FrameworkConfig:
  → Assume: No diagnostic testing available
  → Behavior: SkipDiagnosticTests() in test framework
  → Recovery: Manual configuration required if tests need diagnostics
```

---

## Dependency Resolution Order

### Initialization Sequence

```
1. Parse YAML
   ├─ Validate syntax
   └─ Type check all fields

2. Load Database Files (ARXML, DBC, LDF)
   ├─ Resolve signal definitions
   └─ Verify ECU references

3. Link Channels to Hardware
   ├─ For each logical channel
   ├─ Find mapping in Mappings section
   ├─ Instantiate hardware driver
   └─ Validate mapping compatibility

4. Configure Tracers
   ├─ For each tracer in FrameworkConfig
   ├─ Open log files
   ├─ Link to channels
   └─ Start recording

5. Setup Ethernet Topology (if Ethernet used)
   ├─ Configure VLAN tagging
   ├─ Setup IP-MAC mapping
   ├─ Link channels to ECUs
   └─ Validate topology consistency

6. Configure Publisher
   ├─ Create thread pool if MultiThreaded
   ├─ Assign channels to threads
   └─ Start event dispatcher

7. Test System Ready
   └─ All components initialized, ready for test cases
```

**Missing chunk:** Create `mtf_initialization_sequence_001`

---

## Error Handling Strategy

### Severity Levels

**CRITICAL** - Stops initialization:
```
- Missing mandatory Channels section
- Invalid YAML syntax
- Unmapped logical channel reference
- Hardware connection failure
```

**ERROR** - Skips feature:
```
- Missing optional tracer
- Invalid VLAN configuration
- Diagnostics config invalid
- Power supply mapping missing
```

**WARNING** - Continues:
```
- Unused mapping (defined but not referenced)
- Redundant field (overridden elsewhere)
- Performance setting outside recommended range
```

**INFO** - Logged:
```
- Initialization steps
- Configuration summary
- Hardware detected
```

**Missing chunk:** Create `mtf_error_handling_001`

---

## Configuration Merging

### Scenario: Multiple Config Layers

```
System Config (defaults):
  Publisher: SingleThreaded
  BufferSize: 4096

User Config (MTF.yaml):
  Publisher: MultiThreaded
  MaxConnections: 100

Test Config (runtime override):
  Publisher: SingleThreaded  ← Overrides user config
  TimeLimit: 300s
  
Result = Merge(System, User, Test) with priority:
  Test > User > System
```

**Missing chunk:** Create `mtf_config_merging_001`

---

## New Chunks Needed

| Chunk ID | Title | Purpose | Section |
|----------|-------|---------|---------|
| `mtf_validation_rules_001` | Validation Rules and Constraints | Define what makes valid config | Execution |
| `mtf_resolution_order_001` | Channel-to-Hardware Resolution | How references are resolved | Execution |
| `mtf_priority_rules_001` | Priority & Precedence Rules | How defaults and precedence work | Execution |
| `mtf_hardware_initialization_001` | Hardware Initialization Sequence | How hardware is brought online | Execution |
| `mtf_conflict_resolution_001` | Conflict Resolution Strategies | How mapping conflicts are handled | Execution |
| `mtf_fallback_rules_001` | Fallback Behavior | What happens when config missing | Execution |
| `mtf_initialization_sequence_001` | Complete Initialization Pipeline | Full startup sequence | Execution |
| `mtf_error_handling_001` | Error Handling & Recovery | Error severity and handling | Execution |
| `mtf_config_merging_001` | Configuration Merging Strategy | How multi-layer configs merge | Execution |

---

## Integration with RAG Knowledge Base

### Update Process:

1. **Create new "Execution" subcategory**
   ```
   subcategory: "Execution - Logic"
   subcategory: "Execution - Resolution"
   subcategory: "Execution - Initialization"
   ```

2. **Add relationship type:** `execution_explains`
   ```json
   {
     "from": "mtf_channels_fields",
     "to": "mtf_resolution_order_001",
     "type": "execution_explains",
     "description": "Field definitions come to life in resolution phase"
   }
   ```

3. **Create execution flow diagram** (visual reference):
   ```
   Parsing → Validation → Resolution → Initialization → Ready
        ↓
   [RAG chunks explain each phase]
   ```

---

## Query Examples for LLM

### User asks: "What if two devices claim the same channel?"
**RAG retrieves:**
- `mtf_conflict_resolution_001`
- `mtf_priority_rules_001`
- `mtf_error_handling_001`

### User asks: "Why did my config fail with 'unmapped channel'?"
**RAG retrieves:**
- `mtf_resolution_order_001`
- `mtf_validation_rules_001`
- `mtf_error_handling_001`

### User asks: "What's the initialization order?"
**RAG retrieves:**
- `mtf_initialization_sequence_001`
- `mtf_hardware_initialization_001`
- `mtf_config_merging_001`

---

## Summary: The Missing Layer

**Before (incomplete):** "Here's how to define configuration"

**After (complete):** "Here's how configuration is defined, validated, resolved, and executed at runtime"

This execution logic layer transforms the knowledge base from **declarative** (what to configure) to **operative** (how it works).
