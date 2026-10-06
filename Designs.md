# Frontend Design System & UI Specifications (Designs.md)
## Project: Sniply — Anti-Overengineering & Real-Time Code Optimization Assistant

---

## 1. Design System Overview

The Sniply design system bridges two distinct environments:
1. **The In-Editor HUD (Heads-Up Display)**: Ultra-minimalist, high-contrast, non-distracting overlays that integrate into Google Colab, LeetCode, Jupyter, and web IDEs.
2. **The Web Experience (`landing.html` & `dashboard.html`)**: Clean, editorial aesthetic inspired by Google Sans typography, breathing atmospheric blur spheres, and WCAG AAA contrast ratios.

---

## 2. Core UI Component Specifications

### 2.1 The In-Editor Auto-Tooltip Popover (Figma Node 8:301)
When Sniply identifies an over-engineered pattern or syntax bug, it renders an anchored popover connected by a sleek lead line to the code:

```html
<!-- Connecting Lead Line & Anchored Popover -->
<div class="sniply-tooltip-container flex items-center pointer-events-auto z-[999999]">
  <!-- Lead Line -->
  <div class="w-[60px] sm:w-[120px] md:w-[180px] h-[1.5px] bg-[#1e1e1e] shrink-0"></div>

  <!-- Popover Card -->
  <div class="bg-white border border-[#1e1e1e] rounded-[10px] px-4 py-3 shadow-xl flex items-center gap-4 shrink-0">
    <!-- Code Badge -->
    <div class="bg-[#d9d9d9]/60 rounded-[5px] px-2.5 py-1 text-xs font-mono text-black opacity-85 whitespace-nowrap">
      max_val = my_list[0]
    </div>

    <!-- Diagnostic Rationale -->
    <div class="text-xs text-black font-normal leading-relaxed whitespace-nowrap">
      <p class="font-medium">Fails if the list contains only negative numbers</p>
      <p class="text-gray-500">Fixes default 0 return value</p>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center gap-2 shrink-0">
      <!-- Accept / Correct Button -->
      <button type="button" class="w-8 h-7 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer" title="Accept Fix (In-Place Replace)">
        <img src="assets/check.svg" alt="✓" class="w-3.5 h-3.5 object-contain" />
      </button>

      <!-- Dismiss / Reject Button -->
      <button type="button" class="w-8 h-7 bg-black rounded-full flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer" title="Reject / Dismiss">
        <img src="assets/cross.svg" alt="✕" class="w-3.5 h-3.5 object-contain" />
      </button>
    </div>
  </div>
</div>
```

---

### 2.2 The In-Editor Snippet Highlighter
Non-destructive DOM highlight overlay placed over the specific offending line, keyword, or block:

```css
.sniply-code-highlight {
  position: absolute;
  background: rgba(245, 158, 11, 0.18);
  border-bottom: 2px solid #f59e0b;
  border-radius: 3px;
  pointer-events: none;
  animation: sniply-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes sniply-pulse {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 0.4; }
}
```

---

### 2.3 The Floating Extension Controller Pill
Stationed in the bottom-right corner of the active editor viewport:

```html
<div id="sniply-pill-inner" style="
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999999;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #12130f;
  color: #ffffff;
  padding: 10px 18px;
  border-radius: 999px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.35);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255,255,255,0.15);
">
  <span style="font-size: 15px;">⚡</span>
  <span>Sniply Code Coach</span>
  <span style="opacity: 0.7; font-size: 11px; background: rgba(255,255,255,0.18); padding: 2px 8px; border-radius: 6px;">
    Ctrl + .
  </span>
</div>
```

---

### 2.4 Landing Page Extension CTA (`landing.html` / `index.html`)
Mandatory auth-gated CTA ensuring user registration into Neon DB before downloading:

```html
<div class="flex items-center gap-4">
  <!-- Auth-Gated Download Button (Opens Google Sign-In Modal if logged out) -->
  <button type="button" onclick="handleDownloadClick(event)" class="bg-[#12130f] text-white text-lg font-normal rounded-[20px] px-8 h-[63px] hover:bg-black transition-all hover:scale-[1.02] shadow-md cursor-pointer">
    Get extension (.zip)
  </button>

  <!-- Launch Dashboard (Gated behind Auth) -->
  <button type="button" onclick="handleDashboardClick(event)" class="border border-black/20 text-[#12130f] hover:bg-black/5 text-lg font-normal rounded-[20px] px-8 h-[63px] flex items-center justify-center transition-all cursor-pointer">
    Launch Dashboard ↗
  </button>
</div>
```

---

### 2.5 Step-by-Step Progress Dashboard Components (`dashboard.html`)
Live telemetry cards powered by Neon PostgreSQL:

```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
  <!-- Metric Card 1: Big-O Reductions -->
  <div class="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
    <div class="text-xs uppercase font-semibold text-gray-500 tracking-wider">Complexity Downgrades</div>
    <div class="text-3xl font-bold text-[#12130f] mt-2">O(N²) ➔ O(N)</div>
    <div class="text-xs text-emerald-600 font-medium mt-1">⚡ 84% algorithmic improvements</div>
  </div>

  <!-- Metric Card 2: Lines Eliminated -->
  <div class="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
    <div class="text-xs uppercase font-semibold text-gray-500 tracking-wider">Bloat Lines Trimmed</div>
    <div class="text-3xl font-bold text-[#12130f] mt-2">1,420 lines</div>
    <div class="text-xs text-emerald-600 font-medium mt-1">📉 Reduced code bloat across sessions</div>
  </div>

  <!-- Metric Card 3: Syntax Errors Corrected -->
  <div class="bg-white border border-black/10 rounded-2xl p-6 shadow-sm">
    <div class="text-xs uppercase font-semibold text-gray-500 tracking-wider">Syntax Errors Fixed</div>
    <div class="text-3xl font-bold text-[#12130f] mt-2">96 resolved</div>
    <div class="text-xs text-blue-600 font-medium mt-1">✓ Prevented runtime exceptions</div>
  </div>
</div>
```
