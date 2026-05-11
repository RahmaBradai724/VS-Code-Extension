# UML Diagrams

This file consolidates the Mermaid sources for the report diagrams:

- global class diagram
- global sequence diagram
- Sprint 1 class and sequence diagrams
- Sprint 2 class and sequence diagrams
- Sprint 3 class and sequence diagrams
- Sprint 4 class and sequence diagrams

The sprint split follows the planning in the report text and is aligned with the current repository structure.

## Global Class Diagram

```mermaid
classDiagram
direction LR

class Extension {
  +activate(context)
}

class WebviewProvider {
  +open(extensionUri, context)
  +hasInstance()
  +applyPendingLoad()
}

class App {
  +send(command, data)
  +dispatch(action)
}

class MessageHandler {
  +handle(message, webview)
  +channelManager
  +mappingManager
  +currentConfig
}

class StorageService {
  +getAllConfigurations()
  +saveConfiguration(config)
  +getConfigurationById(id)
  +deleteConfiguration(id)
}

class ConfigImporter {
  +importFromFile()
  +importFromUri(uri)
  +parseYAML(text, sourceName)
}

class ConfigGenerator {
  +generate(configuration, mappings)
}

class AIValidator {
  +validate(config, mappings)
  +runAIValidation(config, mappings, yaml)
}

class LocalValidator {
  +validate(config, mappings)
}

class RoutedMtfAgent {
  +ask(question, workspace, onChunk, signal)
}

class KnowledgeBase {
  +search(queryEmbedding, question, topK)
}

class OllamaClient {
  +healthCheck()
  +embed(text)
  +chat(messages, onChunk, signal)
}

class ChannelManager {
  +addLogicalChannel(channel)
  +addHardwareChannel(channel)
  +deleteChannel(id)
  +hydrate(logicalChannels, hardwareChannels)
}

class MappingManager {
  +addMapping(logicalId, hardwareId, configurationId, params)
  +removeMapping(mappingId)
  +getAllMappings()
  +validateCompatibility(logical, hardware)
}

class LogicalChannelRepository {
  +add(channel)
  +get(id)
  +getAll()
  +update(id, updates)
  +delete(id)
}

class HardwareChannelRepository {
  +add(channel)
  +get(id)
  +getAll()
  +update(id, updates)
  +delete(id)
}

class MappingIndex {
  +register(channelId, mappingId)
  +unregister(channelId, mappingId)
  +getMappingsForChannel(channelId)
}

class AuthService {
  +register(user)
  +login(credentials)
  +verifyToken(token)
}

class TokenStorage {
  +getAuthToken()
  +setAuthToken(token)
  +clearAuthToken()
}

class UserRepository
class ConfigurationRepository
class Configuration
class LogicalChannel
class HardwareChannel
class Mapping
class FrameworkConfig
class YamlParser

Extension --> WebviewProvider : opens panel
Extension --> StorageService : bootstraps state
Extension --> ConfigImporter : imports YAML
WebviewProvider *-- MessageHandler : owns
WebviewProvider --> App : hosts UI

MessageHandler --> StorageService : persists local state
MessageHandler --> ChannelManager : channel CRUD
MessageHandler --> MappingManager : mapping CRUD
MessageHandler --> ConfigGenerator : YAML generation
MessageHandler --> AIValidator : validation
MessageHandler --> RoutedMtfAgent : agent answers
MessageHandler --> AuthService : auth flow
MessageHandler --> TokenStorage : token access
MessageHandler --> UserRepository : users
MessageHandler --> ConfigurationRepository : DB configs

AIValidator --> LocalValidator : wraps
RoutedMtfAgent --> KnowledgeBase : retrieves docs
RoutedMtfAgent --> OllamaClient : embeddings and chat

ConfigImporter --> YamlParser : parses YAML
ConfigGenerator --> Configuration : serializes
ConfigGenerator --> MappingManager : reads mappings

ChannelManager --> LogicalChannelRepository : delegates
ChannelManager --> HardwareChannelRepository : delegates
ChannelManager --> MappingIndex : deletion guard

MappingManager --> ChannelManager : resolves channels
MappingManager --> Mapping : creates
MappingManager --> Configuration : binds config

Configuration "1" o-- "many" LogicalChannel
Configuration "1" o-- "many" HardwareChannel
Configuration "1" o-- "many" Mapping
Configuration "1" o-- "1" FrameworkConfig

AuthService --> TokenStorage
ConfigurationRepository --> Configuration
```

## Global Sequence Diagram

```mermaid
sequenceDiagram
autonumber
actor Engineer
participant VSCode
participant Ext as Extension
participant DB as DatabaseService/TypeORM
participant Watcher as MTF File Watcher
participant WP as WebviewProvider
participant UI as React Webview
participant MH as MessageHandler
participant Auth as AuthService
participant Chan as ChannelManager
participant Map as MappingManager
participant Gen as ConfigGenerator
participant Val as AIValidator
participant Agent as RoutedMtfAgent
participant KB as KnowledgeBase
participant LLM as OllamaClient
participant FS as Workspace FS

VSCode->>Ext: activate(context)
Ext->>DB: initialize and test connection
Ext->>Watcher: register MTF.yaml watcher

alt MTF.yaml already exists or is created
  Watcher-->>Ext: detected MTF.yaml
  Ext->>WP: open(extensionUri, context)
else user runs command
  Engineer->>VSCode: execute extension command
  VSCode->>WP: open(extensionUri, context)
end

WP->>UI: render webview
UI->>MH: checkAuth
MH->>Auth: verifyToken(token)

alt token valid
  Auth-->>MH: authenticated user
  MH-->>UI: authSuccess + saved configurations
else token missing or invalid
  MH-->>UI: authRequired
  Engineer->>UI: login or register
  UI->>MH: login/register payload
  MH->>Auth: authenticate user
  Auth-->>MH: JWT token
  MH-->>UI: authSuccess
end

loop configuration workflow
  Engineer->>UI: add channel / add mapping / save framework
  UI->>MH: command(payload)
  alt channel command
    MH->>Chan: add or delete channel
    Chan-->>MH: updated channels
  else mapping command
    MH->>Map: add or remove mapping
    Map-->>MH: updated mappings
  else framework command
    MH-->>UI: configuration updated
  end
  MH->>Gen: generate(currentConfig, mappings)
  Gen-->>MH: YAML preview
  MH-->>UI: state + live YAML
end

opt export configuration
  Engineer->>UI: Generate Config
  UI->>MH: generateConfig
  MH->>Gen: generate(currentConfig, mappings)
  Gen-->>MH: final YAML
  MH->>FS: write MTF.yaml
  MH-->>UI: generation success
end

opt validation
  Engineer->>UI: Run AI validation
  UI->>MH: runAIValidation
  MH->>Val: runAIValidation(config, mappings, yaml)
  Val->>Val: LocalValidator.validate()
  Val-->>MH: diagnostics
  MH-->>UI: validation result
end

opt documentation agent
  Engineer->>UI: Ask question
  UI->>MH: agentAsk(question)
  MH->>Agent: ask(question, workspace)
  Agent->>KB: search(retrieval query)
  KB-->>Agent: top matching chunks
  Agent->>LLM: embed and chat
  LLM-->>Agent: grounded answer
  Agent-->>MH: answer + sources
  MH-->>UI: agentChunk / agentDone
end
```

## Sprint 1 Class Diagram

```mermaid
classDiagram
direction LR

class Channel {
  <<abstract>>
  +id: string
  +name: string
  +type: ChannelType
  +toYAML()
  +toJSON()
}

class LogicalChannel {
  <<abstract>>
  +category: string
  +subclass: string
  +loggingName: string
  +tracerName: string
  +alias: string[]
  +channelId: string
}

class HardwareChannel {
  <<abstract>>
  +category: string
  +subclass: string
  +status: string
  +canDelete(mappingIds)
}

class CANChannel
class LINChannel
class EthernetChannel
class SerialChannel
class IOInputChannel
class BridgeChannel

class CANInterface
class CMInterface
class EthernetAdapter
class LINCard
class SerialPort
class RelayBoard
class BTSRevo

class ChannelManager {
  +addChannel(channel)
  +addLogicalChannel(channel)
  +addHardwareChannel(channel)
  +deleteChannel(id)
}

class LogicalChannelRepository
class HardwareChannelRepository
class MappingIndex
class logicalChannelFactories
class hardwareChannelFactories
class MessageHandler

Channel <|-- LogicalChannel
Channel <|-- HardwareChannel

LogicalChannel <|-- CANChannel
LogicalChannel <|-- LINChannel
LogicalChannel <|-- EthernetChannel
LogicalChannel <|-- SerialChannel
LogicalChannel <|-- IOInputChannel
LogicalChannel <|-- BridgeChannel

HardwareChannel <|-- CANInterface
HardwareChannel <|-- CMInterface
HardwareChannel <|-- EthernetAdapter
HardwareChannel <|-- LINCard
HardwareChannel <|-- SerialPort
HardwareChannel <|-- RelayBoard
HardwareChannel <|-- BTSRevo

MessageHandler --> logicalChannelFactories : create logical
MessageHandler --> hardwareChannelFactories : create hardware
MessageHandler --> ChannelManager : CRUD

ChannelManager --> LogicalChannelRepository
ChannelManager --> HardwareChannelRepository
ChannelManager --> MappingIndex : prevents invalid delete
```

## Sprint 1 Sequence Diagram

```mermaid
sequenceDiagram
autonumber
actor Developer
participant UI as Webview UI
participant MH as MessageHandler
participant CF as Channel Factories
participant CM as ChannelManager
participant LR as LogicalChannelRepository
participant HR as HardwareChannelRepository
participant MI as MappingIndex

alt add logical channel
  Developer->>UI: fill logical form and click Add
  UI->>MH: addLogicalChannel(payload)
  MH->>CF: logicalChannelFactories[subclass](payload)
  CF-->>MH: LogicalChannel instance
  MH->>CM: addLogicalChannel(channel)
  CM->>LR: add(channel)
  LR-->>CM: persisted channel
  CM-->>MH: success
  MH-->>UI: channelAdded + refresh preview
else add hardware channel
  Developer->>UI: fill hardware form and click Add
  UI->>MH: addHardwareChannel(payload)
  MH->>CF: hardwareChannelFactories[subclass](payload)
  CF-->>MH: HardwareChannel instance
  MH->>CM: addHardwareChannel(channel)
  CM->>HR: add(channel)
  HR-->>CM: persisted channel
  CM-->>MH: success
  MH-->>UI: channelAdded + refresh preview
else delete channel
  Developer->>UI: click Delete
  UI->>MH: deleteLogicalChannel(id) or deleteHardwareChannel(id)
  MH->>CM: deleteChannel(id)
  CM->>MI: getMappingsForChannel(id)
  alt channel used in mapping
    MI-->>CM: referenced mapping ids
    CM-->>MH: error
    MH-->>UI: cannot delete channel
  else channel not referenced
    MI-->>CM: empty set
    CM->>LR: delete(id)
    CM->>HR: delete(id) if hardware
    CM-->>MH: success
    MH-->>UI: channelDeleted + refresh preview
  end
end
```

## Sprint 2 Class Diagram

```mermaid
classDiagram
direction LR

class Mapping {
  +mappingId: string
  +configurationId: string
  +logicalChannelId: string
  +hardwareChannelId: string
  +hwChannel: number
  +operationMode: string
}

class MappingManager {
  +addMapping(logicalId, hardwareId, configurationId, params)
  +removeMapping(mappingId)
  +getAllMappings()
  +validateCompatibility(logical, hardware)
  +validateMappingRules()
}

class MappingValidator {
  +validateCompatibility(logical, hardware)
  +validateMappingRules(mappings)
}

class DefaultCompatibilityStrategy

class ChannelManager {
  +getLogicalChannel(id)
  +getHardwareChannel(id)
  +registerMappingForChannel(channelId, mappingId)
  +unregisterMappingForChannel(channelId, mappingId)
}

class ConfigGenerator {
  +generate(configuration, mappings)
  +generateChannelsSection()
  +generateMappingsSection()
  +generateFrameworkConfigSection()
}

class ConfigValidator {
  +validate(configuration, mappings)
}

class Configuration
class LogicalChannel
class HardwareChannel
class MessageHandler
class YamlPreview

MessageHandler --> MappingManager : mapping commands
MessageHandler --> ConfigGenerator : preview and export
YamlPreview --> MessageHandler : request YAML

MappingManager --> ChannelManager : resolve channels
MappingManager --> MappingValidator : compatibility rules
MappingValidator --> DefaultCompatibilityStrategy

MappingManager --> Mapping : create and store
ConfigGenerator --> Configuration
ConfigGenerator --> MappingManager : read mappings
ConfigGenerator --> ConfigValidator : pre-generation validation

Configuration "1" o-- "many" Mapping
Mapping --> LogicalChannel
Mapping --> HardwareChannel
```

## Sprint 2 Sequence Diagram

```mermaid
sequenceDiagram
autonumber
actor Developer
participant UI as Webview UI
participant MH as MessageHandler
participant MM as MappingManager
participant CM as ChannelManager
participant MV as MappingValidator
participant CG as ConfigGenerator
participant FS as Workspace FS

Developer->>UI: select logical and hardware channels
UI->>MH: addMapping(payload)
MH->>MM: addMapping(logicalId, hardwareId, configurationId, params)
MM->>CM: getLogicalChannel(logicalId)
CM-->>MM: logical channel
MM->>CM: getHardwareChannel(hardwareId)
CM-->>MM: hardware channel
MM->>MV: validateCompatibility(logical, hardware)

alt incompatible or duplicate mapping
  MV-->>MM: invalid
  MM-->>MH: error
  MH-->>UI: mappingRejected
else valid mapping
  MV-->>MM: valid
  MM->>CM: registerMappingForChannel(logicalId, mappingId)
  MM->>CM: registerMappingForChannel(hardwareId, mappingId)
  MM-->>MH: mapping created
  MH->>CG: generate(currentConfig, mappings)
  CG-->>MH: updated YAML preview
  MH-->>UI: mappingAdded + live YAML
end

opt export final YAML
  Developer->>UI: click Generate Config
  UI->>MH: generateConfig
  MH->>CG: generate(currentConfig, mappings)
  CG-->>MH: final YAML
  MH->>FS: write MTF.yaml
  MH-->>UI: generationSuccess
end
```

## Sprint 3 Class Diagram

```mermaid
classDiagram
direction LR

class Extension {
  +activate(context)
  +handleExistingFile(uri)
  +createFreshConfig(uri)
}

class ConfigImporter {
  +importFromFile()
  +importFromUri(uri)
  +parseYAML(text, sourceName)
}

class YamlParser {
  +parse(yamlText, sourceName)
}

class FrameworkConfig {
  +publisherConfig
  +ethernetConfig
  +tracers
}

class PublisherConfig
class EthernetConfig
class ASCIITracer
class PCAPTracer
class AutoLoadState
class WebviewProvider
class MessageHandler
class StorageService
class ConfigurationRepository

Extension --> WebviewProvider : auto-opens
Extension --> AutoLoadState : prepares pending config
Extension --> StorageService : loads saved config

ConfigImporter --> YamlParser : parses existing YAML
MessageHandler --> ConfigImporter : import command
MessageHandler --> FrameworkConfig : save framework section
MessageHandler --> ConfigurationRepository : persist framework

FrameworkConfig o-- PublisherConfig
FrameworkConfig o-- EthernetConfig
FrameworkConfig o-- ASCIITracer
FrameworkConfig o-- PCAPTracer
```

## Sprint 3 Sequence Diagram

```mermaid
sequenceDiagram
autonumber
actor Developer
participant VSCode
participant Ext as Extension
participant Watcher as MTF File Watcher
participant FS as Workspace FS
participant WP as WebviewProvider
participant UI as Webview UI
participant MH as MessageHandler
participant CI as ConfigImporter
participant YP as YamlParser
participant Repo as ConfigurationRepository
participant CG as ConfigGenerator

VSCode->>Ext: activate(context)
Ext->>Watcher: watch MTF.yaml

alt new or existing MTF.yaml detected
  Watcher-->>Ext: MTF.yaml event
  Ext->>FS: readFile(uri)
  alt file is empty
    Ext->>FS: write default template
  end
  Ext->>WP: open()
end

alt import existing YAML
  Developer->>UI: click Import Config
  UI->>MH: importConfig
  MH->>CI: importFromFile()
  CI->>YP: parse(yamlText, sourceName)
  YP-->>CI: config + warnings
  CI-->>MH: imported configuration
  MH-->>UI: refresh panels + preview
else save framework configuration
  Developer->>UI: edit Framework panel and click Save
  UI->>MH: saveFramework(payload)
  MH->>Repo: persist current configuration
  MH->>CG: generate(currentConfig, mappings)
  CG-->>MH: updated YAML
  MH-->>UI: frameworkSaved + preview
end
```

## Sprint 4 Class Diagram

```mermaid
classDiagram
direction LR

class RoutedMtfAgent {
  +ask(question, workspace, onChunk, signal)
}

class KnowledgeBase {
  +search(queryEmbedding, question, topK)
}

class OllamaClient {
  +healthCheck()
  +embed(text)
  +chat(messages, onChunk, signal)
}

class MessageHandler {
  +agentAsk(message, webview)
  +checkAuth(webview)
  +login(message, webview)
}

class AuthService {
  +login(credentials)
  +verifyToken(token)
}

class TokenStorage {
  +getAuthToken()
  +setAuthToken(token)
  +clearAuthToken()
}

class UserRepository
class ConfigurationRepository
class DiagramPanel
class MappingTopology
class HardwareGallery
class ProductCatalogue
class App

MessageHandler --> RoutedMtfAgent : ask agent
RoutedMtfAgent --> KnowledgeBase : retrieve evidence
RoutedMtfAgent --> OllamaClient : local models

MessageHandler --> AuthService : verify and login
AuthService --> TokenStorage
MessageHandler --> UserRepository
MessageHandler --> ConfigurationRepository

App --> DiagramPanel : renders diagrams page
DiagramPanel --> MappingTopology : mapping graph
DiagramPanel --> HardwareGallery : hardware view
DiagramPanel --> ProductCatalogue : device info
```

## Sprint 4 Sequence Diagram

```mermaid
sequenceDiagram
autonumber
actor Developer
participant UI as Webview UI
participant MH as MessageHandler
participant Auth as AuthService
participant Token as TokenStorage
participant Agent as RoutedMtfAgent
participant KB as KnowledgeBase
participant LLM as OllamaClient
participant Diagram as DiagramPanel

UI->>MH: checkAuth
MH->>Token: getAuthToken()
MH->>Auth: verifyToken(token)

alt valid session
  Auth-->>MH: authenticated user
  MH-->>UI: authSuccess + user configurations
else login required
  MH-->>UI: authRequired
  Developer->>UI: submit credentials
  UI->>MH: login(payload)
  MH->>Auth: login(credentials)
  Auth-->>MH: JWT token
  MH->>Token: setAuthToken(token)
  MH-->>UI: authSuccess
end

par ask documentation agent
  Developer->>UI: ask MTF question
  UI->>MH: agentAsk(question)
  MH->>Agent: ask(question, workspace)
  Agent->>KB: search(retrieval query)
  KB-->>Agent: relevant chunks
  Agent->>LLM: embed(question) and chat(messages)
  LLM-->>Agent: grounded answer
  Agent-->>MH: answer + sources
  MH-->>UI: agentChunk / agentDone
and open configuration diagram
  Developer->>UI: open Diagrams page
  UI->>Diagram: render current config graph
  Diagram-->>UI: logical channels + hardware channels + mappings
end
```