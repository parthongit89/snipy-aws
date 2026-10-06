# System Rules & Engineering Protocols (Rules.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Core Principles & Philosophy

The **Sniply: Anti-Overengineering Assistant** practices the aggressive simplicity it enforces on codebases:

1. **Simplicity Over Cleverness (KISS)**: The best solution is the one with the fewest moving parts, easiest readability, and optimal runtime efficiency.
2. **You Aren't Gonna Need It (YAGNI)**: Speculative abstractions, unused helper functions, and premature generalization are treated as bugs.
3. **Algorithmic Scalability ($O(n^2) \to O(n)$)**: Target algorithmic bottlenecks (nested iterations, redundant allocations) rather than trivial cosmetic micro-tweaks.
4. **Focused Context (100–120 Lines)**: Maintain a strict 100–120 line sliding window around the active cursor to prevent token bloat and LLM hallucinations.
5. **Interactive In-Editor Feedback**: Rather than disruptive full-file rewrites, surface non-destructive code highlights with an anchored tooltip containing instant **[✓ Correct / Accept]** and **[✕ Wrong / Reject]** buttons.
6. **Continuous Learning**: Track accepted and rejected optimizations in Neon DB to adaptively refine subsequent AI recommendations.

---

## 2. Engineering Directives: What to Implement vs. Avoid

### 🟢 What to Implement (Best Practices)
1. **Standard Library Primacy**:
   - In Python: Use built-in modules (`collections`, `itertools`, `set`, `dict`, `functools`, `dataclasses`) over custom loops or heavy third-party packages.
   - In JavaScript/TypeScript: Use native modern primitives (`Map`, `Set`, `Array.prototype.flatMap`, `structuredClone`) over external libraries like `lodash`.
2. **Algorithmic Complexity Downgrading**:
   - Replace nested lookup loops ($O(N \times M)$) with Hash Sets or Hash Maps ($O(N + M)$).
   - Replace manual sorting + binary searches with built-in bisect/lookup utilities where appropriate.
3. **Structured JSON Responses**: The AI optimization engine must output deterministic JSON containing:
   - `original_complexity`: Time & space complexity string.
   - `optimized_complexity`: Time & space complexity string.
   - `summary`: Concise educational rationale.
   - `line_changes`: Array of line-level diffs (`line_num`, `action`: `delete` | `replace` | `insert`, `code`, `reason`).
   - `tooltip`: Highlight coordinates, original badge, cleaner code badge, diagnostic rationale, and action bindings.
4. **Multi-Browser Compatibility**:
   - Build for Manifest V3 ensuring seamless operation in both **Google Chrome** and **Microsoft Edge**.
5. **Mandatory Auth-Gated Onboarding Flow**:
   - Require 1-click Google OAuth authentication prior to downloading `sniply-extension.zip`.
   - Every active developer is automatically registered in Neon DB (`sniply_users`), ensuring 100% telemetry, tracking, and dashboard metric synchronization.
6. **Standardized Keyboard Hooks**:
   - **`Ctrl + .`**: Global hook to activate extension monitoring.
   - **`Ctrl + Backspace`**: Global hook to deactivate extension monitoring.
7. **Database Persistence & Daily Auto-Sync**:
   - Connect to Neon PostgreSQL using connection pooling (`psycopg2.pool`) and SSL (`sslmode=require`).
   - Batch sync session metrics, accepted/rejected counts, and Big-O improvements to power `dashboard.html`.

### 🔴 What to Avoid (Anti-Patterns & Prohibited Behavior)
1. **NEVER Allow AI "Overflow Logic"**:
   - Reject unprompted abstract factory patterns or wrapper classes.
   - Reject defensive null-checks for types already guaranteed upstream.
   - Reject redundant intermediate variables created solely for a single return statement.
2. **NEVER Rewrite Unrelated Code**:
   - Limit modifications strictly to the suboptimal logic. Do not reformat the user's entire file or rename unrelated variables.
3. **NEVER Block the Browser Main Thread**:
   - Context window extraction in web editors must execute asynchronously with a 350ms typing debounce.
4. **NEVER Allow Anonymous Untracked Extension Downloads**:
   - Extension downloads must never bypass Google authentication. Anonymous downloads prevent user registration, leaving telemetry unmapped and breaking dashboard analytics.
5. **NEVER Hardcode Secrets**:
   - Zero AWS Access Keys, Bedrock tokens, or database passwords in source code or Git commits. Always use `.env`.

---

## 3. The 7-Step Ponytail Decision Ladder

Before suggesting any code modification, Claude 3.5 Haiku and system subagents must climb this ladder:

```
[1. YAGNI] ──> Does this code or abstraction need to exist? (If no -> DELETE)
      │
[2. Codebase] ──> Does a utility already exist here? (If yes -> REUSE)
      │
[3. Stdlib] ──> Does standard library do this in 1-2 lines? (If yes -> USE STDLIB)
      │
[4. Native] ──> Does a language/platform native construct solve it? (If yes -> USE NATIVE)
      │
[5. Complexity] ──> Can we drop big-O time/space complexity? (If yes -> OPTIMIZE)
      │
[6. Compactness] ──> Can it be written cleanly in fewer lines? (If yes -> CONDENSE)
      │
[7. Minimum Code] ──> Deliver the shortest working diff.
```

---

## 4. Prompt Engineering Directives for Claude 3.5 Haiku

When formatting prompts sent to AWS Bedrock:
- **Temperature**: Set to `0.1` for maximum determinism and conciseness.
- **Top P**: Set to `0.9`.
- **System Role**: *"You are an expert senior software engineer and simplicity auditor. You specialize in eliminating over-engineering, reducing time complexity, removing dead/redundant variables, and teaching scalable, idiomatic syntax."*
- **User Adaptive Context**: Inject user's historical accepted vs. rejected preferences from Neon DB to avoid repeating rejected optimization styles.
- **Output Format**: Strictly enforce raw JSON without conversational preambles or markdown backticks around the JSON envelope.

---

## 5. Standard Error Handling Protocol

```json
{
  "success": false,
  "error": {
    "code": "INVALID_CONTEXT_WINDOW",
    "message": "Selected context exceeds 120 lines. Please reduce selection to 100-120 lines."
  }
}
```

Standard Status Codes:
- `200 OK`: Optimization completed successfully.
- `400 Bad Request`: Empty snippet or invalid language parameter.
- `401 Unauthorized`: Missing or invalid AWS credentials / API key.
- `413 Payload Too Large`: Snippet exceeds the maximum 120-line window.
- `429 Too Many Requests`: Rate limit exceeded on AWS Bedrock endpoint.
- `500 Internal Server Error`: Unhandled backend exception (sanitized response returned).
