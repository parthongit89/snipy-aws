# AI System Memory & Architectural Decision Log (Memory.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Overview & AGY Integration

`Memory.md` maintains long-term architectural continuity, decisions, and system constraints across AI agent sessions. Any agent (Antigravity AGY, Claude 3.5 Haiku, Bedrock agent, or MCP tool) working in this repository must align with these logged conventions.

---

## 2. Active Technical Stack & Environment

- **Core AI Model**: **Claude 3.5 Haiku** (`anthropic.claude-3-5-haiku-20241022-v1:0`) hosted on **AWS Bedrock** ($0.1$ temperature).
- **Cloud Database**: **Neon PostgreSQL** serverless database with connection pooling and enforced SSL (`sslmode=require`).
- **Primary Client MVP**: **WebExtension (Manifest V3)** for **Google Chrome** and **Microsoft Edge**.
- **Web Surfaces**: Hosted on **Vercel** (`landing.html` / `index.html` and `dashboard.html`).
- **Backend API Gateway**: Python 3.11+ / FastAPI on Render / AWS App Runner with AST static analyzer.
- **Secondary Client**: Model Context Protocol (MCP) server for professional IDEs (Cursor, Claude Desktop, Antigravity).

---

## 3. Log of Key Architectural Decisions

1. **Strict 100–120 Line Sliding Context Window**:
   - *Rationale*: Processing unbounded code dilutes model focus, increases latency, and generates unwanted large-scale file rewrites. 100–120 lines gives sufficient scope to detect function contracts while keeping fixes local.
2. **In-Editor Popover Tooltip with [✓ Correct] & [✕ Wrong] Action Buttons**:
   - *Rationale*: Wholesale replacements intimidate developers and hide the educational logic. In-editor tooltips with targeted code highlights allow developers to accept fixes in-place or dismiss with a single click.
3. **Neon PostgreSQL Cloud Persistence**:
   - *Rationale*: Session metrics, mistake classifications, and optimization telemetry are synced daily with Neon DB to enable continuous learning, personalized AI tuning, and progressive dashboard updates.
4. **Universal Extension Acquisition (`landing.html`)**:
   - *Rationale*: Developers can download `sniply-extension.zip` directly without a mandatory sign-in wall. Authentication via Firebase Google Sign-In is optional for cross-device cloud sync.
5. **Cross-Browser Compatibility (Chrome & Edge)**:
   - *Rationale*: Target both Google Chrome (`chrome://extensions/`) and Microsoft Edge (`edge://extensions/`) via standard Manifest V3 APIs.
6. **Global Keyboard Hooks (`Ctrl + .` & `Ctrl + Backspace`)**:
   - *Rationale*: `Ctrl + .` starts real-time monitoring; `Ctrl + Backspace` deactivates the extension.
7. **Continuous Learning Feedback Loop**:
   - *Rationale*: User accept and reject feedback is tracked in Neon DB and injected into prompt context to prevent recurring rejected patterns.

---

## 4. Context Preservation Checklist for AI Agents

Before generating code or executing tasks in this repository:
- [ ] Confirm compliance with the **Ponytail 7-Step Ladder** (`.agents/rules/ponytail.md`).
- [ ] Ensure the context chunking logic remains strictly bounded to **100–120 lines**.
- [ ] Verify that model outputs strictly follow the structured JSON diff schema defined in `Skill.md`.
- [ ] Ensure in-editor tooltips provide both [✓ Correct] and [✕ Wrong] action handlers.
- [ ] Maintain parameterized SQL queries in `backend/db.py` for all Neon DB interactions.
