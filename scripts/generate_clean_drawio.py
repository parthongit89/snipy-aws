import xml.etree.ElementTree as ET
import xml.dom.minidom

def build_drawio_xml():
    # Root mxfile
    mxfile = ET.Element("mxfile", host="app.diagrams.net", modified="2026-10-02T19:20:00.000Z", agent="Antigravity", version="24.7.17")
    diagram = ET.SubElement(mxfile, "diagram", name="Sniply Clean Architecture", id="sniply-clean-architecture")
    
    # Graph model
    model = ET.SubElement(diagram, "mxGraphModel", 
                          dx="1600", dy="1100", grid="1", gridSize="10", 
                          guides="1", tooltips="1", connect="1", arrows="1", 
                          fold="1", page="1", pageScale="1", pageWidth="1700", 
                          pageHeight="1250", math="0", shadow="1")
    
    root = ET.SubElement(model, "root")
    
    # Base cells
    ET.SubElement(root, "mxCell", id="0")
    ET.SubElement(root, "mxCell", id="1", parent="0")

    # Helper function to add elements
    def add_cell(cell_id, parent_id, value, style, x, y, width, height, vertex=1, is_edge=False, source=None, target=None):
        attribs = {"id": str(cell_id), "parent": str(parent_id)}
        if is_edge:
            attribs["edge"] = "1"
            if source: attribs["source"] = str(source)
            if target: attribs["target"] = str(target)
        else:
            attribs["vertex"] = "1"
        if style: attribs["style"] = style
        if value: attribs["value"] = value
        
        cell = ET.SubElement(root, "mxCell", **attribs)
        if not is_edge:
            geo = ET.SubElement(cell, "mxGeometry", x=str(x), y=str(y), width=str(width), height=str(height))
            geo.set("as", "geometry")
        else:
            geo = ET.SubElement(cell, "mxGeometry", relative="1")
            geo.set("as", "geometry")
        return cell

    # ================== TITLE BANNER ==================
    banner_style = ("rounded=1;whiteSpace=wrap;html=1;fillColor=#12130F;strokeColor=#2D3748;"
                    "fontColor=#FFFFFF;fontStyle=1;fontSize=20;align=center;shadow=1;arcSize=10;")
    add_cell("title_banner", "1", 
             "<div style='font-size: 22px; font-weight: 700; letter-spacing: 0.5px;'>⚡ SNIPLY: CLEAN ARCHITECTURE &amp; SYSTEM DATAFLOW</div>"
             "<div style='font-size: 13px; font-weight: 400; opacity: 0.85; margin-top: 6px;'>Anti-Overengineering &amp; Real-Time Code Optimization Assistant | AWS Bedrock (Claude 3.5 Haiku) &amp; Neon DB</div>",
             banner_style, 40, 20, 1620, 75)

    # ================== 5 HORIZONTAL SWIMLANES / TIERS ==================
    
    # --- TIER 1: Onboarding & Distribution ---
    t1_box = ("swimlane;html=1;startSize=34;rounded=1;arcSize=6;shadow=1;"
              "fillColor=#F8FAFC;strokeColor=#64748B;strokeWidth=1.5;"
              "fontStyle=1;fontSize=13;fontColor=#0F172A;collapsible=0;align=left;spacingLeft=14;")
    add_cell("tier1_lane", "1", "TIER 1: WEB ONBOARDING &amp; MULTI-BROWSER EXTENSION DISTRIBUTION", 
             t1_box, 40, 115, 1620, 155)

    # --- TIER 2: Client Activation & Editor Runtime ---
    t2_box = ("swimlane;html=1;startSize=34;rounded=1;arcSize=6;shadow=1;"
              "fillColor=#F0FDF4;strokeColor=#16A34A;strokeWidth=1.5;"
              "fontStyle=1;fontSize=13;fontColor=#14532D;collapsible=0;align=left;spacingLeft=14;")
    add_cell("tier2_lane", "1", "TIER 2: CLIENT ACTIVATION, EDITOR HOOKS &amp; 100-120 LINE CONTEXT SLIDING WINDOW", 
             t2_box, 40, 290, 1620, 185)

    # --- TIER 3: In-Editor Tooltip & Feedback Overlay ---
    t3_box = ("swimlane;html=1;startSize=34;rounded=1;arcSize=6;shadow=1;"
              "fillColor=#FFFBEB;strokeColor=#D97706;strokeWidth=1.5;"
              "fontStyle=1;fontSize=13;fontColor=#78350F;collapsible=0;align=left;spacingLeft=14;")
    add_cell("tier3_lane", "1", "TIER 3: REAL-TIME IN-EDITOR CODE HIGHLIGHTING &amp; INTERACTIVE AUTO-TOOLTIP OVERLAY", 
             t3_box, 40, 495, 1620, 185)

    # --- TIER 4: AI Gateway & AWS Bedrock Intelligence ---
    t4_box = ("swimlane;html=1;startSize=34;rounded=1;arcSize=6;shadow=1;"
              "fillColor=#F5F3FF;strokeColor=#7C3AED;strokeWidth=1.5;"
              "fontStyle=1;fontSize=13;fontColor=#4C1D95;collapsible=0;align=left;spacingLeft=14;")
    add_cell("tier4_lane", "1", "TIER 4: FASTAPI GATEWAY, AST STATIC AUDIT &amp; AWS BEDROCK (CLAUDE 3.5 HAIKU)", 
             t4_box, 40, 700, 1620, 195)

    # --- TIER 5: Neon DB Persistence & Step-by-Step Dashboard ---
    t5_box = ("swimlane;html=1;startSize=34;rounded=1;arcSize=6;shadow=1;"
              "fillColor=#F0F9FF;strokeColor=#0284C7;strokeWidth=1.5;"
              "fontStyle=1;fontSize=13;fontColor=#0C4A6E;collapsible=0;align=left;spacingLeft=14;")
    add_cell("tier5_lane", "1", "TIER 5: NEON DB PERSISTENCE, CONTINUOUS USER ADAPTATION &amp; LIVE DASHBOARD", 
             t5_box, 40, 915, 1620, 260)


    # ================== NODES IN TIER 1 ==================
    card_landing = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#94A3B8;"
                    "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_landing", "1", 
             "<b>Landing Page (landing.html / index.html)</b><br/>"
             "<span style='font-size: 11px; color: #475569;'>• Hosted on Vercel Edge Global CDN<br/>"
             "• Hero, Video Demo &amp; Code Inspector Demo<br/>"
             "• Action CTA: <b>Get Extension</b></span>", 
             card_landing, 70, 160, 310, 90)

    card_auth = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FAF5FF;strokeColor=#A855F7;"
                 "strokeWidth=2;fontColor=#581C87;align=center;arcSize=8;")
    add_cell("n_auth_gate", "1", 
             "<b>Mandatory Google Auth Gate &amp; Neon DB Registration</b><br/>"
             "<span style='font-size: 11px; color: #6B21A8;'>"
             "• <b>Mandatory Google OAuth</b> before download<br/>"
             "• Upserts user profile in Neon DB (sniply_users)<br/>"
             "• Enables 100% developer tracking &amp; telemetry</span>", 
             card_auth, 440, 160, 370, 90)

    card_pkg = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#EFF6FF;strokeColor=#3B82F6;"
                "strokeWidth=1.5;fontColor=#1E3A8A;align=center;arcSize=8;")
    add_cell("n_download", "1", 
             "<b>Extension ZIP Download (sniply-extension.zip)</b><br/>"
             "<span style='font-size: 11px; color: #1D4ED8;'>• Unlocked exclusively post-registration<br/>"
             "• Auto-triggers download of .zip package<br/>"
             "• Manifest V3 pre-packaged for Chrome &amp; Edge</span>", 
             card_pkg, 870, 160, 370, 90)

    card_browsers = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#94A3B8;"
                     "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_browsers", "1", 
             "<b>Target Browser Runtime Setup</b><br/>"
             "<span style='font-size: 11px; color: #334155;'>"
             "• <b>Google Chrome</b>: chrome://extensions/ (Dev Mode)<br/>"
             "• <b>Microsoft Edge</b>: edge://extensions/ (Dev Mode)<br/>"
             "• Load Unpacked Folder / ZIP Installation</span>", 
             card_browsers, 1300, 160, 330, 90)


    # ================== NODES IN TIER 2 ==================
    card_keys = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#DCFCE7;strokeColor=#16A34A;"
                 "strokeWidth=2;fontColor=#14532D;align=center;arcSize=8;")
    add_cell("n_shortcuts", "1", 
             "<b>Extension Keyboard Controller</b><br/>"
             "<div style='font-size: 12px; margin-top: 4px;'>"
             "<b style='color: #15803D;'>[ Ctrl + . ]</b> : Start / Activate Extension<br/>"
             "<b style='color: #B91C1C;'>[ Ctrl + Backspace ]</b> : Stop / Deactivate</div>"
             "<span style='font-size: 10px; color: #166534;'>Global keydown interceptor &amp; status indicator</span>", 
             card_keys, 70, 340, 310, 110)

    card_editors = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#16A34A;"
                    "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_editors", "1", 
             "<b>Active Coding Environments (DOM Targets)</b><br/>"
             "<span style='font-size: 11px; color: #334155;'>"
             "• <b>Monaco Editor</b> (Google Colab, LeetCode, CodeChef)<br/>"
             "• <b>CodeMirror 5/6</b> (JupyterLab, Classic Notebook, Replit)<br/>"
             "• <b>Ace Editor</b> (Programiz, OnlineGDB, HackerRank)<br/>"
             "• Standard <b>&lt;textarea&gt;</b> &amp; editable elements</span>", 
             card_editors, 440, 340, 370, 110)

    card_extractor = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#F0FDF4;strokeColor=#22C55E;"
                      "strokeWidth=1.5;fontColor=#14532D;align=center;arcSize=8;")
    add_cell("n_extractor", "1", 
             "<b>Sliding Window Context Extractor</b><br/>"
             "<span style='font-size: 11px; color: #15803D;'>"
             "• Captures <b>100–120 lines</b> around active cursor<br/>"
             "• Symmetrical expansion to function/block boundaries<br/>"
             "• Debounced typing observer (350ms pause detection)<br/>"
             "• Language &amp; runtime syntax auto-detection</span>", 
             card_extractor, 870, 340, 370, 110)

    card_worker = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#16A34A;"
                   "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_worker", "1", 
             "<b>Background Service Worker (MV3)</b><br/>"
             "<span style='font-size: 11px; color: #334155;'>"
             "• State management (ACTIVE / IDLE / OPTIMIZING)<br/>"
             "• Cross-tab message dispatcher &amp; tab router<br/>"
             "• chrome.storage.local secure credentials vault<br/>"
             "• Coordinates background seeking on dashboard.html</span>", 
             card_worker, 1300, 340, 330, 110)


    # ================== NODES IN TIER 3 ==================
    card_highlight = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FEF3C7;strokeColor=#D97706;"
                      "strokeWidth=2;fontColor=#78350F;align=center;arcSize=8;")
    add_cell("n_highlight", "1", 
             "<b>In-Editor Code Snippet Highlighter</b><br/>"
             "<span style='font-size: 11px; color: #92400E;'>"
             "• Injects non-destructive overlay on exact DOM coordinates<br/>"
             "• Targets: Specific line, keyword, variable, or statement block<br/>"
             "• Visual amber/rose pulse highlight over bloated code</span>", 
             card_highlight, 70, 545, 380, 110)

    card_tooltip = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#D97706;"
                    "strokeWidth=2;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_tooltip", "1", 
             "<b>Interactive Auto-Sync Popover Tooltip</b><br/>"
             "<span style='font-size: 11px; color: #1E293B;'>"
             "• Connected to offending code line via anchoring line<br/>"
             "• <b>Code Badge:</b> Shows original vs proposed cleaner syntax<br/>"
             "• <b>Diagnostic Rationale:</b> Syntax errors, intention &amp; Big-O drop<br/>"
             "• Action Buttons: <b>[✓ Correct / Accept]</b> &amp; <b>[✕ Wrong / Reject]</b></span>", 
             card_tooltip, 510, 545, 450, 110)

    card_accept = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#DCFCE7;strokeColor=#16A34A;"
                   "strokeWidth=1.5;fontColor=#14532D;align=center;arcSize=8;")
    add_cell("n_accept_act", "1", 
             "<b>[✓ Correct / Accept] Flow</b><br/>"
             "<span style='font-size: 11px; color: #15803D;'>"
             "• Replaces code in-place in editor<br/>"
             "• Monaco / CM / Ace native API call<br/>"
             "• Emits ACCEPT event to Neon DB</span>", 
             card_accept, 1020, 545, 270, 110)

    card_reject = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FEE2E2;strokeColor=#DC2626;"
                   "strokeWidth=1.5;fontColor=#7F1D1D;align=center;arcSize=8;")
    add_cell("n_reject_act", "1", 
             "<b>[✕ Wrong / Reject] Flow</b><br/>"
             "<span style='font-size: 11px; color: #991B1B;'>"
             "• Dismisses tooltip cleanly<br/>"
             "• Preserves user's original code<br/>"
             "• Emits REJECT event for AI tuning</span>", 
             card_reject, 1340, 545, 290, 110)


    # ================== NODES IN TIER 4 ==================
    card_gateway = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#7C3AED;"
                    "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_gateway", "1", 
             "<b>FastAPI Optimization Gateway</b><br/>"
             "<span style='font-size: 11px; color: #475569;'>"
             "• <b>Endpoints:</b> /api/v1/optimize, /api/v1/sync, /api/v1/analytics<br/>"
             "• High concurrency ASGI runner with rate limiting<br/>"
             "• Token-efficient JSON stream formatter</span>", 
             card_gateway, 70, 755, 340, 115)

    card_ast = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#EDE9FE;strokeColor=#8B5CF6;"
                "strokeWidth=1.5;fontColor=#4C1D95;align=center;arcSize=8;")
    add_cell("n_ast", "1", 
             "<b>Static AST &amp; Intent Analyzer</b><br/>"
             "<span style='font-size: 11px; color: #5B21B6;'>"
             "• Pre-parses code into AST (Tree-Sitter / Python ast)<br/>"
             "• Detects nested loop depths (O(N²) risk), unused vars<br/>"
             "• Syntax error &amp; indentation mistake pre-check<br/>"
             "• <b>Ponytail Guardrails:</b> YAGNI &amp; standard library ladder</span>", 
             card_ast, 460, 755, 360, 115)

    card_cache = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#8B5CF6;"
                  "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_cache", "1", 
             "<b>Pattern &amp; Rule Cache Layer</b><br/>"
             "<span style='font-size: 11px; color: #475569;'>"
             "• Normalized AST structural hash lookup<br/>"
             "• Instant cache hit response (<b>&lt; 50ms</b>)<br/>"
             "• Bypasses LLM invocation for known anti-patterns</span>", 
             card_cache, 870, 755, 310, 115)

    card_bedrock = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#4C1D95;strokeColor=#2E1065;"
                    "strokeWidth=2;fontColor=#FFFFFF;align=center;arcSize=8;")
    add_cell("n_bedrock", "1", 
             "<b>AWS Bedrock AI Inference Engine</b><br/>"
             "<span style='font-size: 11px; color: #E9D5FF;'>"
             "• <b>Model:</b> Claude 3.5 Haiku (anthropic.claude-3-5-haiku-20241022)<br/>"
             "• Temperature: 0.1 (Strict deterministic simplification)<br/>"
             "• Ultra-fast low latency (&lt; 700ms), 100-120 line focus<br/>"
             "• Outputs Big-O, line-by-line diffs &amp; tooltip JSON payload</span>", 
             card_bedrock, 1230, 755, 400, 115)


    # ================== NODES IN TIER 5 ==================
    card_neon = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#0284C7;strokeColor=#0369A1;"
                 "strokeWidth=2;fontColor=#FFFFFF;align=center;arcSize=8;")
    add_cell("n_neondb", "1", 
             "<b>Neon PostgreSQL Cloud Database</b><br/>"
             "<div style='font-size: 11px; color: #E0F2FE; text-align: left; padding: 4px 10px;'>"
             "• <b>sniply_users:</b> firebase_uid, email, display_name, last_active<br/>"
             "• <b>optimizations:</b> code, complexity before/after, mistakes JSONB<br/>"
             "• <b>daily_metrics:</b> metric_date, total_fixes, tokens_used, syntax_errors<br/>"
             "• <b>Security:</b> Connection pooling, sslmode=require, least-privilege</div>", 
             card_neon, 70, 970, 390, 175)

    card_sync = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#FFFFFF;strokeColor=#0284C7;"
                 "strokeWidth=1.5;fontColor=#0F172A;align=center;arcSize=8;")
    add_cell("n_autosync", "1", 
             "<b>Daily &amp; Working Auto-Sync Pipeline</b><br/>"
             "<span style='font-size: 11px; color: #334155;'>"
             "• Background batch synchronization per day / session<br/>"
             "• Records accepted vs rejected tooltip interactions<br/>"
             "• Aggregates code health metrics &amp; lines reduced<br/>"
             "• Fallback offline queue in chrome.storage.local</span>", 
             card_sync, 510, 970, 340, 175)

    card_adaptive = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#E0F2FE;strokeColor=#0284C7;"
                     "strokeWidth=1.5;fontColor=#0C4A6E;align=center;arcSize=8;")
    add_cell("n_adaptive", "1", 
             "<b>Continuous Learning &amp; AI Improvement</b><br/>"
             "<span style='font-size: 11px; color: #0369A1;'>"
             "• Ingests user acceptance history from Neon DB<br/>"
             "• Tailors Claude 3.5 Haiku prompts to user's style<br/>"
             "• Suppresses repeatedly rejected optimization types<br/>"
             "• Enhances accuracy based on coding experience</span>", 
             card_adaptive, 890, 970, 340, 175)

    card_dash = ("rounded=1;whiteSpace=wrap;html=1;shadow=1;fillColor=#0F172A;strokeColor=#38BDF8;"
                 "strokeWidth=2;fontColor=#FFFFFF;align=center;arcSize=8;")
    add_cell("n_dashboard", "1", 
             "<b>Step-by-Step Progress Dashboard (dashboard.html)</b><br/>"
             "<div style='font-size: 11px; color: #BAE6FD; text-align: left; padding: 4px 8px;'>"
             "• <b>Live Telemetry:</b> Total lines saved, Big-O downgrade score<br/>"
             "• <b>Daily Activity Heatmap:</b> Fix count, syntax errors prevented<br/>"
             "• <b>Step-by-Step History:</b> Complete chronological inspection log<br/>"
             "• <b>Continuous Sync:</b> Automatically reflects real-time improvements</div>", 
             card_dash, 1270, 970, 360, 175)


    # ================== CONNECTORS / EDGES ==================
    edge_t1 = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#3B82F6;strokeWidth=2;fontColor=#1E3A8A;fontSize=10;"
    add_cell("e1", "1", "Click 'Get Extension'", edge_t1, 0, 0, 0, 0, is_edge=True, source="n_landing", target="n_auth_gate")
    add_cell("e2", "1", "Mandatory OAuth & Register", edge_t1, 0, 0, 0, 0, is_edge=True, source="n_auth_gate", target="n_download")
    add_cell("e3", "1", "Extract & Load Unpacked", edge_t1, 0, 0, 0, 0, is_edge=True, source="n_download", target="n_browsers")
    add_cell("e3b", "1", "Upsert sniply_users", edge_t1, 0, 0, 0, 0, is_edge=True, source="n_auth_gate", target="n_neondb")

    edge_t2 = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#16A34A;strokeWidth=2;fontColor=#14532D;fontSize=10;"
    add_cell("e4", "1", "Installs on Chrome/Edge", edge_t2, 0, 0, 0, 0, is_edge=True, source="n_browsers", target="n_worker")
    add_cell("e5", "1", "Ctrl + . Activates Hook", edge_t2, 0, 0, 0, 0, is_edge=True, source="n_shortcuts", target="n_editors")
    add_cell("e6", "1", "Active cell / cursor focus", edge_t2, 0, 0, 0, 0, is_edge=True, source="n_editors", target="n_extractor")
    add_cell("e7", "1", "Extracted 100-120 lines", edge_t2, 0, 0, 0, 0, is_edge=True, source="n_extractor", target="n_worker")

    edge_t3 = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#D97706;strokeWidth=2;fontColor=#78350F;fontSize=10;"
    add_cell("e8", "1", "Inspect payload", edge_t3, 0, 0, 0, 0, is_edge=True, source="n_worker", target="n_gateway")
    add_cell("e9", "1", "Render highlight on code", edge_t3, 0, 0, 0, 0, is_edge=True, source="n_highlight", target="n_tooltip")
    add_cell("e10", "1", "Click Accept", edge_t3, 0, 0, 0, 0, is_edge=True, source="n_tooltip", target="n_accept_act")
    add_cell("e11", "1", "Click Reject", edge_t3, 0, 0, 0, 0, is_edge=True, source="n_tooltip", target="n_reject_act")
    add_cell("e12", "1", "In-place editor replacement", edge_t3, 0, 0, 0, 0, is_edge=True, source="n_accept_act", target="n_editors")

    edge_t4 = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#7C3AED;strokeWidth=2;fontColor=#4C1D95;fontSize=10;"
    add_cell("e13", "1", "Parse AST & loop depth", edge_t4, 0, 0, 0, 0, is_edge=True, source="n_gateway", target="n_ast")
    add_cell("e14", "1", "Check cache", edge_t4, 0, 0, 0, 0, is_edge=True, source="n_ast", target="n_cache")
    add_cell("e15", "1", "Invoke Haiku (Temp 0.1)", edge_t4, 0, 0, 0, 0, is_edge=True, source="n_ast", target="n_bedrock")
    add_cell("e16", "1", "Return structured diff & tooltip", edge_t4, 0, 0, 0, 0, is_edge=True, source="n_bedrock", target="n_highlight")

    edge_t5 = "edgeStyle=orthogonalEdgeStyle;rounded=1;orthogonalLoop=1;jettySize=auto;html=1;strokeColor=#0284C7;strokeWidth=2;fontColor=#0C4A6E;fontSize=10;"
    add_cell("e17", "1", "Log optimization & metrics", edge_t5, 0, 0, 0, 0, is_edge=True, source="n_gateway", target="n_neondb")
    add_cell("e18", "1", "Batch sync session telemetry", edge_t5, 0, 0, 0, 0, is_edge=True, source="n_autosync", target="n_neondb")
    add_cell("e19", "1", "Learn from user feedback", edge_t5, 0, 0, 0, 0, is_edge=True, source="n_neondb", target="n_adaptive")
    add_cell("e20", "1", "Inject learned user context", edge_t5, 0, 0, 0, 0, is_edge=True, source="n_adaptive", target="n_bedrock")
    add_cell("e21", "1", "Live queries & stats", edge_t5, 0, 0, 0, 0, is_edge=True, source="n_neondb", target="n_dashboard")
    add_cell("e22", "1", "Feedback events (accept/reject)", edge_t5, 0, 0, 0, 0, is_edge=True, source="n_accept_act", target="n_autosync")

    rough_string = ET.tostring(mxfile, 'utf-8')
    reparsed = xml.dom.minidom.parseString(rough_string)
    pretty_xml = reparsed.toprettyxml(indent="  ")
    # Clean up empty lines created by minidom
    cleaned_xml = "\n".join([line for line in pretty_xml.split("\n") if line.strip() != ""])
    return cleaned_xml

if __name__ == "__main__":
    xml_content = build_drawio_xml()
    with open("c:/Users/Abhijeet Manohar/OneDrive/Desktop/Internal_Hackthons/aws_2/sniply.drawio", "w", encoding="utf-8") as f:
        f.write(xml_content)
    print("sniply.drawio generated and saved successfully!")
