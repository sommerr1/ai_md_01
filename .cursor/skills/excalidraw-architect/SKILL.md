---
name: excalidraw-architect
description: Generate comprehensive visual architecture diagrams using Mermaid.js syntax or Excalidraw-compatible structures to represent the system design.
triggers: ["excalidraw-architect", "draw architecture", "нарисуй схему", "архитектурная схема"]
---

# Workflow

When the user asks to visualize the architecture, your goal is to map text and concepts into a clean, easy-to-understand visual diagram.

1. **Identify system components:** Extract key layers (Frontend, Backend API, Database, Third-party services, Caching, Event queues).
2. **Generate Mermaid.js code block:** Use strict, well-formatted Mermaid block syntax (`graph TD` or `sequenceDiagram`) as it is highly compatible with markdown previews.
3. **Map data and control flows:** Clearly label arrows with the action happening (e.g., "HTTPS POST /login", "SQL Query", "Websocket event").
4. **Explain the diagram:** Below the visual block, provide a short, structured breakdown of why this architecture was chosen and how data flows through it.

# Quality Bar
- **Language Constraint:** ALWAYS respond, explain, and label the diagram components in Russian.
- Ensure the diagram syntax is flawless and won't crash the renderer.
- Keep the visual layout balanced and readable (avoid overly complex crossing lines where possible).
- Do not write application code; focus 100% on the structural blueprint.
