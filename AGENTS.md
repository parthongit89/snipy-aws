# Autonomous AI Agent Protocols (AGENTS.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

This document governs the operating rules, context budgets, and behavior for autonomous AI coding agents (Antigravity AGY, Claude 3.5 Haiku, Bedrock agents, and MCP assistants) working on the **Sniply: Anti-Overengineering Assistant**.

---

## 1. Primary Directives

1. **Anti-Bloat Priority**: Every suggestion must reduce complexity, eliminate dead code, collapse redundant variables, and optimize runtime performance.
2. **Context Window Constraint**: Maintain analysis focus strictly on a **100–120 line sliding window**. Do not expand context arbitrarily or generate full-project rewrites.
3. **In-Editor Tooltip Protocol**: Formulate non-destructive in-editor highlights and popovers equipped with **[✓ Correct / Accept]** and **[✕ Wrong / Reject]** action triggers.
4. **Keyboard Hook Integrity**: Ensure extension listeners respect **`Ctrl + .`** (Start/Activate) and **`Ctrl + Backspace`** (Stop/Deactivate).
5. **Cross-Browser Standards**: Guarantee compatibility for both **Google Chrome** and **Microsoft Edge** Manifest V3 environments.
6. **Continuous Learning Synchronization**: Ensure telemetry and user feedback events are queued and synced to **Neon PostgreSQL** per day/session.

---

## 2. Decision Hierarchy (The Ponytail Ladder)

Whenever generating code or reviewing user submissions:
- **Rung 1**: Can this feature/code be deleted without breaking functional requirements? (YAGNI).
- **Rung 2**: Can a Python/JS standard library primitive replace this entire helper function?
- **Rung 3**: Can the time complexity be brought down from $O(n^2)$ or $O(n \log n)$ to $O(n)$ or $O(1)$?
- **Rung 4**: Can temporary variables and intermediate arrays be eliminated via streaming, generators, or direct returns?
- **Rung 5**: Generate the minimal, clean diff.

---

## 3. Prohibited Patterns (Blocklist)

- ❌ **No Overflow Logic**: Do not add defensive boilerplate for conditions already guaranteed by upstream types.
- ❌ **No Speculative Micro-Optimizations**: Do not sacrifice readability for unverified micro-benchmarks; focus on macroscopic algorithmic complexity.
- ❌ **No Unprompted Architectural Creep**: Do not recommend converting a simple 20-line script into a multi-layered OOP microservice.
- ❌ **No Heavy Third-Party Libraries for Simple Tasks**: Never pull in `lodash`, `pandas`, or heavy dependencies for tasks solvable in 2 lines of vanilla code.
- ❌ **No Mandatory Login for Extension Download**: Never gate `sniply-extension.zip` behind authentication on `landing.html`.

---

## 4. MCP & Subagent Coordination

When delegating tasks to subagents:
- **`code_auditor`**: Scans 100–120 lines, flags complexity hot spots, dead variables, and redundant loops.
- **`code_simplifier`**: Produces the minimal, line-by-line diff and complexity metrics.
- **`tooltip_engine`**: Formats the in-editor highlight coordinates, code badges, and accept/reject action payloads.
- **`mcp_handler`**: Formats responses for Model Context Protocol (MCP) clients (Cursor, Claude Desktop, Antigravity).
