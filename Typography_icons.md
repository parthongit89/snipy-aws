# Typography & Icons Strategy (Typography_icons.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Executive Summary

Developer tools demand uncompromising legibility. The Sniply typography and icon system pairs **Google Sans Flex & Plus Jakarta Sans** for UI headers and educational guidance with **JetBrains Mono & Fira Code** for code diffs, inline badges, and Big-O notation, accompanied by crisp SVG micro-icons (`check.svg`, `cross.svg`).

---

## 2. Typeface Hierarchy

| Role | Font Family | Weights | Usage |
| :--- | :--- | :--- | :--- |
| **Monospace / Code** | **JetBrains Mono** / **Google Sans Code** | `400 (Regular)`, `600 (SemiBold)` | In-editor code badges (`max_val = my_list[0]`), diff blocks, and Big-O complexity tags |
| **UI Copy & Labels** | **Google Sans Flex** / **Plus Jakarta Sans** | `400 (Regular)`, `500 (Medium)`, `700 (Bold)` | Tooltip explanations, dashboard metrics, button labels, and navbar links |
| **Display / Hero** | **Google Sans** | `400 (Normal)`, `500 (Medium)` | Landing page hero header and section titles |

---

## 3. Typographical Scale Matrix

| Component Surface | Target Text | Font Family | Size | Weight | Line Height |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tooltip Badge** | `max_val = my_list[0]` | JetBrains Mono | `13px` | `500` | `1.4` |
| **Tooltip Rationale** | Diagnostic description | Google Sans Flex | `13px` | `400` | `1.45` |
| **Pill Shortcut** | `Ctrl + .` | Google Sans Flex | `11px` | `600` | `1.0` |
| **Hero Title** | *"Stop Over-Engineering"* | Google Sans | `36px` | `400` | `1.35` |
| **Dashboard Metric** | `O(N²) ➔ O(N)` | JetBrains Mono | `28px` | `700` | `1.2` |

---

## 4. Icon System & SVG Assets

| Asset Name | File Path | Visual Meaning | Where Used |
| :--- | :--- | :--- | :--- |
| **Check Icon** | `assets/check.svg` | Accept fix & apply in-place to editor | In-editor popover [✓ Correct] button |
| **Cross Icon** | `assets/cross.svg` | Dismiss recommendation & record feedback | In-editor popover [✕ Wrong] button |
| **Sniply Logo** | `assets/logo.svg` | Brand mark & indicator | Navbar, favicon, floating pill |
| **Step Numbers** | `assets/step1.svg`–`step5.svg` | Visual installation milestones | Landing page 5-step extension installation guide |
| **GitHub Mark** | `assets/github.png` | Repository & developer link | Landing page footer |
| **Bolt Symbol** | `⚡` (Unicode) | Instant simplicity & performance trigger | Floating controller pill & toast notifications |
