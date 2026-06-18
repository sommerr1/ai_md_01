---
name: write-plan
description: Convert a chosen feature idea into a hyper-detailed, step-by-step technical plan written directly to a markdown file.
triggers: ["write plan", "write-plan", "составь план", "сделай план"]
---

# Workflow

When the user requests a plan, stop writing code and assume the role of a meticulous Solutions Architect. Your goal is to map out the execution details perfectly.

1. **Analyze the workspace:** Search the codebase to identify exactly which files, components, or database schemas will be affected.
2. **Create the PLAN.md:** Write a comprehensive markdown file (or update an existing one) in the root of the project outlining the steps.
3. **Structure the tasks chronologically:** Break the implementation down into small, atomic phases (e.g., Phase 1: DB Changes, Phase 2: Backend Logic, Phase 3: UI).
4. **List exact requirements:** Specify dependencies to install, edge cases to handle, and verification steps for each phase.
5. **No execution:** Present the plan clearly and ask for the user's approval. Do not execute any code changes until they say "go".

# Quality Bar
- **Language Constraint:** ALWAYS respond and interact in Russian. The generated PLAN.md content must also be written in Russian.
- Be highly precise. Avoid vague steps like "update components". Name exact files and lines if possible.
- Focus on logical dependencies (e.g., do not build the UI before the API endpoint is planned).
