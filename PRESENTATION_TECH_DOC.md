# Technical Documentation — PFE Presentation
## Project 13: Configuration Management System for Hardware and Logical Channels

> **Candidate:** Rahma Bradai | **Supervisors:** Yosra Hadj Taieb + Hamza Rgaieg
> **Presentation Date:** May 5, 2026 — 3:30 PM

---

## 1. Business Context (Métier)

### 1.1 Domain: Automotive Embedded Systems Testing

The **MTF (Modular Test Framework)** is a proprietary test automation framework used for bench-level testing of automotive ECUs (Electronic Control Units) and embedded systems.

A test bench is a physical setup composed of **hardware devices** (CAN interfaces, LIN cards, Ethernet adapters, relay boards, power supplies, etc.) wired to the vehicle's electronic components. The MTF framework orchestrates communication between the software under test and these hardware devices through a **configuration file** (`config.yaml`).

### 1.2 Problem Statement

Before this project, engineers had to **manually write and maintain** the `config.yaml` file in YAML format. This was:
- **Error-prone** — invalid field names, incompatible channel mappings, duplicate IDs
- **Time-consuming** — large configurations have tens of channels and complex mappings
- **Inaccessible** — required deep knowledge of the MTF YAML schema
- **Poorly validated** — no tooling to catch errors before running tests

### 1.3 Solution

A **VS Code Extension** that provides a graphical, form-based interface for:
1. Creating and managing hardware and logical channels
2. Defining and validating mappings between them
3. Generating a valid `config.yaml` from the configuration
4. Importing/exporting existing configurations
5. AI-powered validation and an intelligent Q&A assistant for the MTF format

---

## 2. Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    VS Code Extension Host                     │
│  ┌──────────────────┐     ┌──────────────────────────────┐  │
│  │  extension.ts    │────▶│   WebviewProvider (singleton) │  │
│  │  (activation)    │     │   Panel: full editor tab       │  │
│  └──────────────────┘     └──────────────┬───────────────┘  │
│                                           │ messages          │
│  ┌────────────────────────────────────────▼──────────────┐   │
│  │                  MessageHandler                        │   │
│  │  (routes UI events → services)                        │   │
│  └─────┬──────────────┬──────────────┬───────────────────┘   │
│        │              │              │                         │
│  ┌─────▼────┐  ┌──────▼─────┐  ┌────▼────────────────────┐  │
│  │ Storage  │  │  Config    │  │  AI Layer                 │  │
│  │ Service  │  │  Generator │  │  ├─ AIValidator (Gemini)  │  │
│  │ (TypeORM)│  │  Importer  │  │  └─ MtfAgent (Ollama RAG)│  │
│  └──────────┘  └────────────┘  └─────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                  Webview (React + TypeScript)                  │
│  Dashboard | Logical | Hardware | Mappings | Generate         │
│  Framework | Diagram | Agent | Configs | Tracer | Login       │
└──────────────────────────────────────────────────────────────┘
```

### 2.1 Technology Stack

| Layer | Technology |
|---|---|
| Extension runtime | TypeScript (VS Code Extension API) |
| Frontend UI | React + TypeScript (Webview panel) |
| Local database | SQLite via TypeORM |
| YAML processing | js-yaml |
| AI Validation | Google Gemini API (REST) |
| RAG Agent | Ollama (local LLM: `llama3.2`) + `nomic-embed-text` |
| Authentication | JWT (`jsonwebtoken`) + bcryptjs |
| Build tooling | Webpack (extension + webview bundles), TypeScript |

---

## 3. Domain Model

### 3.1 Logical Channels

Logical channels represent the **abstract test channel** the test software communicates with. They are protocol-oriented.

| Category | Subclass | Description |
|---|---|---|
| `CAN` / `CANFD` | `CANChannel` | Controller Area Network bus |
| `LIN` | `LINChannel` | Local Interconnect Network |
| `ETHERNET` | `EthernetChannel` | IP-based automotive Ethernet |
| `FLEXRAY` / `FR` | `FlexRayChannel` | FlexRay deterministic bus |
| `IOINPUT` | `IOInputChannel` | Digital/analog input |
| `IOOUTPUT` | `IOOutputChannel` | Digital/analog output |
| `IOSERIAL` | `IOSerialChannel` | Serial I/O |
| `SERIAL` | `SerialChannel` | Serial port channel |
| `PS` | `PSChannel` | Power supply channel |
| `BRIDGE` | `BridgeChannel` | Bridge/relay channel |

Key attributes: `name`, `channelId` (unique positive integer), `category`, `subclass`, `loggingName`, `tracerName`, `alias[]`

### 3.2 Hardware Channels

Hardware channels represent **physical devices** on the test bench.

| Category | Subclass | Description |
|---|---|---|
| `CAN_INTERFACE` | `CANInterface`, `CIBInterface`, `CMInterface` | CAN/CANFD hardware cards |
| `ETHERNET_ADAPTER` | `EthernetAdapter` | Network interface card |
| `LIN_CARD` (via CM) | `LINCard` | LIN bus hardware card |
| `SERIAL_PORT` | `SerialPort` | Physical COM port |
| `RELAY_BOARD` | `RelayBoard` | Relay switching board |
| `HID_RELAY` | `HIDRelay` | USB HID relay |
| `ANALOG_DEVICE` | `AnalogDevice`, `TEAnalog` | Analog I/O hardware |
| `HH_LOAD` | `HHLoad` | Electronic load |
| `BTS_REVO` | `BTSRevo` | Battery simulator |
| `GENESYS_PS` / `MANSON_PS` | `GenesysPowerSupply`, `MansonPowerSupply` | Programmable PSUs |

### 3.3 Mapping

A **Mapping** links one Logical Channel to one Hardware Channel. The mapping is subject to **compatibility rules** (e.g., a `CANChannel` can only be mapped to a `CANInterface`/`CIBInterface`/`CMInterface`).

Mapping attributes: `hwChannel` (port number), `operationMode`, `keySlot` (FlexRay), `nodeType`, `btsFunction`, `initValue`, etc.

**Business rule**: each logical channel can be mapped to **at most one** hardware channel.

### 3.4 Framework Configuration

Configures the MTF runtime:
- **PublisherConfig**: `SingleThreaded` or `MultiThreaded` execution mode
- **Tracers**: PCAP, ASCII, and diagnostics tracers for logging
- **EthernetConfig**: VLAN, IP settings for Ethernet channels
- **DiagnosticsConfig**: UDS/OBD diagnostic settings

---

## 4. Key Features

### 4.1 Channel Management (CRUD)
- Full form-based create/edit/delete for both logical and hardware channels
- Field validation on every channel type's specific required fields
- Duplicate name and ID detection

### 4.2 Mapping Engine
- Compatibility matrix enforced at mapping creation time
- Prevents double-mapping of a logical channel
- Validates all mappings before config generation

### 4.3 Config Generation (`config.yaml`)
- Serializes the entire configuration to MTF-compliant YAML
- Handles special formatting: inline port ranges, VLAN tag sequences, sequence indicators
- Includes framework config (tracers, publishers, diagnostics)
- Validates the configuration before generation and shows errors

### 4.4 Config Import
- Import existing `config.yaml` via file picker
- YAML parsed and mapped back to the domain model
- Warnings surfaced for unknown or unmappable fields

### 4.5 AI Validation (Gemini API)
- Sends the generated YAML + a structured summary to Gemini Pro
- Analyzes: protocol mismatches, best practice violations, missing recommended fields, suspicious mappings
- Returns structured JSON: `errors`, `warnings`, `suggestions`
- Falls back gracefully to local validation when no API key is configured

### 4.6 MTF Agent — RAG Chatbot (Local AI)
**Pipeline:**
1. User question → embed with Ollama `nomic-embed-text`
2. Hybrid retrieval from the knowledge base: `65% vector cosine similarity + 35% keyword score + importance bonus + graph expansion`
3. Top-K chunks (K=5) injected into a grounded system prompt
4. Answer streamed token-by-token from Ollama `llama3.2`

**Knowledge base**: pre-built JSON file (`knowledge_base.json`) containing embedded chunks of MTF documentation, with `relatedIds` for graph-based expansion.

### 4.7 Visualization
- Interactive hardware diagram showing the test bench topology
- Visual representation of channel-to-device mappings

### 4.8 Authentication
- JWT-based user session (24h token expiry)
- Passwords hashed with bcryptjs (10 rounds)
- Token stored securely in VS Code's `SecretStorage`

### 4.9 Persistence
- TypeORM + SQLite local database
- `workspaceState` used to associate a `MTF.yaml` workspace with a stored configuration ID
- Auto-load mechanism: detects `MTF.yaml` presence at startup and rehydrates the last configuration

---

## 5. Important Flows

### 5.1 First-Time Workspace Initialization

```
Workspace opens with MTF.yaml
         │
         ▼
extension.ts: onDidCreate watcher fires
         │
         ▼
createFreshConfig(): write default YAML + create in-memory config
         │
         ▼
workspaceState.update(WS_KEY, newId)
         │
         ▼
setAutoLoad(config)  →  consumed by MessageHandler on next checkAuth
```

### 5.2 Config Generation Flow

```
User clicks "Generate config.yaml"
         │
         ▼
ConfigValidator.validate()
 ├─ name / channel count / mapping count checks
 ├─ naming rules (no spaces, no leading digit)
 ├─ unique channelId checks
 └─ tracer reference integrity
         │
     errors? ──yes──▶ show errors in UI, stop
         │ no
         ▼
ConfigGenerator.generate()
 ├─ serialize logical channels (grouped by subclass)
 ├─ serialize hardware channels
 ├─ serialize mappings with all parameters
 ├─ serialize framework config (tracers, publishers)
 └─ format YAML (port ranges, VLAN tags, sequence dashes)
         │
         ▼
Write to config.yaml in workspace
```

### 5.3 AI Validation Flow

```
Local validation (ConfigValidator / LocalValidator)
         │
         ▼
Call Gemini Pro API with YAML + channel summary
         │
         ▼
Parse JSON response { isValid, errors, warnings, suggestions }
         │
         ▼
Merge with local results → display in UI
```

---

## 6. Project Structure

```
src/
├── extension.ts              # Extension entry point, command registration
├── ai/
│   ├── aiValidator.ts        # Gemini-based AI validation
│   ├── LocalValidator.ts     # Rule-based local validation
│   ├── MtfAgent.ts           # RAG pipeline (Ollama)
│   └── mtf/
│       ├── KnowledgeBase.ts  # Hybrid vector+keyword retrieval
│       └── OllamaClient.ts   # Ollama REST client (stream)
├── models/                   # TypeORM entities (LogicalChannel, HardwareChannel, Mapping…)
├── services/
│   ├── auth/                 # JWT authentication
│   ├── channel/              # Channel CRUD + repositories
│   ├── config/               # ConfigGenerator, ConfigImporter, ConfigValidator, YamlParser
│   ├── database/             # TypeORM repositories
│   ├── mapping/              # MappingManager, compatibility rules
│   └── storage/              # StorageService (in-memory + DB bridge)
└── ui/
    ├── webviewProvider.ts    # Singleton webview panel
    ├── MessageHandler.ts     # UI ↔ services message router
    └── webview/              # React application
        └── panels/           # Dashboard, Logical, Hardware, Mappings, Generate…
```

---

## 7. Current Status & Next Steps

### Done ✓
- Full CRUD for logical and hardware channels (all types)
- Mapping engine with compatibility validation
- `config.yaml` generation with correct MTF formatting
- Config import (YAML → domain model)
- AI validation via Gemini API
- Local MTF Agent (RAG) with Ollama
- User authentication (JWT + bcrypt)
- Hardware diagram visualization
- Framework/tracer configuration panel
- SQLite persistence with TypeORM
- Auto-load on workspace open

### Planned / In Progress
- Extended knowledge base coverage for MTF documentation
- Enhanced diagram interactivity (drag-and-drop topology)
- Multi-user collaboration support
- CI/CD pipeline for automated testing
- Publishing to VS Code Marketplace

---

## 8. Live Demo Script

1. **Open a workspace** containing `MTF.yaml` → extension auto-activates, opens dashboard
2. **Create a Logical Channel**: CAN channel `CAN_ECU_1` with `channelId=1`
3. **Create a Hardware Channel**: `CANInterface` named `Peak_USB`
4. **Create a Mapping**: `CAN_ECU_1` → `Peak_USB`
5. **Configure Framework**: set `SingleThreaded` publisher, add a PCAP tracer
6. **Generate config.yaml**: show the resulting YAML file
7. **Run AI Validation**: show Gemini suggestions on the generated config
8. **Ask the MTF Agent**: type "What fields are required for a CAN channel?" → streamed answer with sources

---

*Generated from codebase analysis — April 23, 2026*
