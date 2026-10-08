import os
import smtplib
import threading
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

logger = logging.getLogger("snipy.email")
logger.setLevel(logging.INFO)

# ==============================================================================
# SMTP CONFIGURATION
# ==============================================================================
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "sonavanep899@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_NAME = "Snipy AI"
SENDER_EMAIL = os.getenv("SENDER_EMAIL", SMTP_USER)

APP_URL = "https://snipy-ai.web.app"
LOGO_URL = "https://snipy-ai.web.app/icons/cube-icon.png"

# ==============================================================================
# EMAIL BASE STYLES & GOOGLE SANS FLEX TYPOGRAPHY
# ==============================================================================
BASE_EMAIL_SHELL = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{subject}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap');
    body {{
      margin: 0;
      padding: 0;
      background-color: #07090e;
      font-family: 'Google Sans Flex', 'Google Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #e2e8f0;
      -webkit-font-smoothing: antialiased;
    }}
    .email-container {{
      max-width: 580px;
      margin: 36px auto;
      background-color: #0c101c;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }}
    .email-header {{
      padding: 40px 36px 20px 36px;
      text-align: center;
      background: radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.15) 0%, transparent 70%);
    }}
    .logo-img {{
      width: 54px;
      height: 54px;
      display: inline-block;
      margin-bottom: 12px;
      object-fit: contain;
    }}
    .email-body {{
      padding: 10px 40px 36px 40px;
      line-height: 1.65;
      font-size: 15px;
      color: #cbd5e1;
    }}
    .heading {{
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 22px;
      letter-spacing: -0.02em;
      text-align: center;
    }}
    .salutation {{
      font-size: 16px;
      font-weight: 600;
      color: #f1f5f9;
      margin-bottom: 16px;
    }}
    p {{
      margin: 0 0 16px 0;
    }}
    .highlight {{
      color: #ffffff;
      font-weight: 600;
    }}
    .badge {{
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 14px;
    }}
    .badge-emerald {{
      background-color: rgba(16, 185, 129, 0.12);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }}
    .badge-rose {{
      background-color: rgba(244, 63, 94, 0.12);
      color: #fb7185;
      border: 1px solid rgba(244, 63, 94, 0.3);
    }}
    .badge-cyan {{
      background-color: rgba(56, 189, 248, 0.12);
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }}
    .metric-card {{
      background-color: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      padding: 18px 22px;
      margin: 22px 0;
    }}
    .metric-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      font-size: 14px;
    }}
    .metric-row:last-child {{
      border-bottom: none;
      padding-bottom: 0;
    }}
    .metric-label {{
      color: #94a3b8;
    }}
    .metric-val {{
      color: #ffffff;
      font-weight: 600;
      font-family: monospace;
    }}
    .btn-container {{
      text-align: center;
      margin: 32px 0 20px 0;
    }}
    .btn {{
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: #07090e !important;
      text-decoration: none;
      font-weight: 700;
      font-size: 15px;
      padding: 13px 32px;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.35);
      transition: all 0.2s ease;
    }}
    .btn-rose {{
      background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%);
      color: #ffffff !important;
      box-shadow: 0 4px 20px rgba(244, 63, 94, 0.35);
    }}
    .footer {{
      padding: 24px 36px 32px 36px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      text-align: center;
      font-size: 12px;
      color: #64748b;
    }}
    .footer a {{
      color: #94a3b8;
      text-decoration: underline;
    }}
    .signoff {{
      margin-top: 26px;
      font-size: 15px;
      color: #e2e8f0;
    }}
    .brand-name {{
      font-weight: 700;
      color: #ffffff;
    }}
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <img src="{logo_url}" alt="Snipy AI Cube" class="logo-img" />
      <div>{badge_html}</div>
      <h1 class="heading">{heading}</h1>
    </div>
    <div class="email-body">
      <div class="salutation">Hi {user_name},</div>
      {content_body}
      <div class="btn-container">
        <a href="{cta_url}" class="btn {btn_class}">{cta_text}</a>
      </div>
      <div class="signoff">
        Happy coding!<br>
        <span class="brand-name">— Snipy</span>
      </div>
    </div>
    <div class="footer">
      <div>Snipy v1.0 • Anti-Overengineering Assistant for Python</div>
      <div style="margin-top: 6px;">
        <a href="{app_url}">Visit Snipy</a> &bull; 
        <a href="{app_url}/dashboard">Telemetry Dashboard</a> &bull; 
        <a href="https://github.com/parthongit89/snipy-aws">GitHub</a>
      </div>
    </div>
  </div>
</body>
</html>"""

# ==============================================================================
# CANVA HTML EMAIL TEMPLATE LOADER
# ==============================================================================
CANVA_TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "email_temp", "email_template.html")

def get_canva_welcome_html(user_name="Developer"):
    """Loads Canva-generated HTML template and injects dynamic personalized greeting."""
    if os.path.exists(CANVA_TEMPLATE_PATH):
        try:
            with open(CANVA_TEMPLATE_PATH, "r", encoding="utf-8") as f:
                html = f.read()
            import re
            # Strip third-party tracking scripts for email client compatibility
            html = re.sub(r'<script.*?</script>', '', html, flags=re.DOTALL | re.IGNORECASE)

            # Inject personalized user greeting into Canva table cell
            greeting = f"Hi {user_name},"
            if '&nbsp;</td></tr><tr><td dir="ltr" class="ers-fs-187"' in html:
                html = html.replace('&nbsp;</td></tr><tr><td dir="ltr" class="ers-fs-187"', f'{greeting}</td></tr><tr><td dir="ltr" class="ers-fs-187"')
            elif 'ers-fs-240' in html:
                html = re.sub(r'(class=["\']ers-fs-240["\'][^>]*>).*?(</td>)', r'\g<1>' + greeting + r'\2', html)
            return html
        except Exception as e:
            logger.warning(f"Could not load Canva email template: {e}")
    return None

# ==============================================================================
# 1. WELCOME & ONBOARDING TEMPLATE
# ==============================================================================
def render_welcome_email(user_name="Developer"):
    canva_html = get_canva_welcome_html(user_name)
    if canva_html:
        return canva_html

    heading = "You're all set! Start writing clean code with Snipy"
    badge_html = '<span class="badge badge-emerald">ACCOUNT SYNCED</span>'
    content = """
    <p>Welcome to <span class="highlight">Snipy</span>! We are thrilled to have you on board.</p>
    <p>You have successfully signed in with your Google account, and your profile is now securely synced with your personal developer telemetry dashboard.</p>
    <p>You're just a few steps away from writing cleaner, faster code without the cognitive overload of artificial over-engineering.</p>
    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">Assigned AI Tier</span>
        <span class="metric-val" style="color: #34d399;">Free Tier (10 Tokens / 30 Problems)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">AI Engine</span>
        <span class="metric-val">AWS Bedrock • Claude 3.5 Haiku</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Supported IDEs</span>
        <span class="metric-val">CodeChef, JupyterLab, LeetCode, Colab</span>
      </div>
    </div>
    """
    return BASE_EMAIL_SHELL.format(
        subject="Welcome to Snipy! You're all set to write clean code",
        heading=heading,
        badge_html=badge_html,
        user_name=user_name,
        content_body=content,
        cta_url=f"{APP_URL}/dashboard",
        cta_text="Launch Developer Dashboard",
        btn_class="",
        logo_url=LOGO_URL,
        app_url=APP_URL
    )

# ==============================================================================
# 2. FREE TIER QUOTA EXHAUSTED TEMPLATE (10/10 TOKENS / 30 PROBLEMS)
# ==============================================================================
def render_quota_exhausted_email(user_name="Developer", problems_fixed=30, lines_saved=68):
    heading = "Free Tier Quota Reached (30/30 Problems Fixed)"
    badge_html = '<span class="badge badge-rose">QUOTA EXHAUSTED • SERVICE LOCKED</span>'
    content = f"""
    <p>You've hit your maximum free tier limit of <span class="highlight">{problems_fixed} code problems fixed</span> (10/10 tokens used) on <span class="highlight">Snipy</span>!</p>
    <p>To protect computational resources and maintain high-speed AI performance, your real-time IDE scan service is temporarily paused.</p>
    
    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">Total Code Problems Solved</span>
        <span class="metric-val">{problems_fixed} / 30 (100%)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Redundant Lines Eliminated</span>
        <span class="metric-val" style="color: #34d399;">~{lines_saved} lines saved</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Quadratic O(N²) Loops Cleaned</span>
        <span class="metric-val">100% Converted to O(N)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Current Service Status</span>
        <span class="metric-val" style="color: #fb7185;">🔒 Locked (Free Limit Exhausted)</span>
      </div>
    </div>
    
    <p>Want unlimited code optimizations with zero throttling? Upgrade to <strong>Snipy Pro</strong> to unlock unrestricted real-time scans across all your coding platforms.</p>
    """
    return BASE_EMAIL_SHELL.format(
        subject="[Action Required] Your Snipy Free Quota is Exhausted (30/30 Fixed)",
        heading=heading,
        badge_html=badge_html,
        user_name=user_name,
        content_body=content,
        cta_url=f"{APP_URL}/dashboard#upgrade",
        cta_text="Upgrade to Pro (Unlimited)",
        btn_class="btn-rose",
        logo_url=LOGO_URL,
        app_url=APP_URL
    )

# ==============================================================================
# 3. PRO UPGRADE CONFIRMATION / PAYMENT SUCCESS RECEIPT
# ==============================================================================
def render_pro_activated_email(user_name="Developer", tx_id="TXN_SNIPY_101", amount=49):
    heading = "Welcome to Snipy Pro! Unlimited Access Unlocked 🚀"
    badge_html = '<span class="badge badge-cyan">PRO TIER ACTIVE • UNLIMITED</span>'
    content = f"""
    <p>Thank you for supporting <span class="highlight">Snipy</span>! Your payment of <span class="highlight">₹{amount}</span> has been confirmed, and your developer account has been upgraded to <strong>Snipy Pro</strong>.</p>
    <p>Your 30-problem quota limit has been removed. All optimizations on Google Colab, Jupyter, CodeChef, and LeetCode are now completely unrestricted.</p>
    
    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">Membership Tier</span>
        <span class="metric-val" style="color: #38bdf8;">Snipy Pro (Lifetime Unlimited)</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Transaction Reference</span>
        <span class="metric-val">{tx_id}</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Amount Paid</span>
        <span class="metric-val">₹{amount}.00 INR</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Daily Token Limit</span>
        <span class="metric-val" style="color: #34d399;">∞ Unlimited</span>
      </div>
    </div>
    
    <p>Your extension popup and floating IDE screen HUD will instantly reflect the Pro badge next time you scan.</p>
    """
    return BASE_EMAIL_SHELL.format(
        subject="Payment Confirmed: Snipy Pro is now Active on your Account! 🚀",
        heading=heading,
        badge_html=badge_html,
        user_name=user_name,
        content_body=content,
        cta_url=f"{APP_URL}/dashboard",
        cta_text="Open Pro Dashboard",
        btn_class="",
        logo_url=LOGO_URL,
        app_url=APP_URL
    )

# ==============================================================================
# 4. WEEKLY DEVELOPER TELEMETRY DIGEST
# ==============================================================================
def render_weekly_digest_email(user_name="Developer", stats=None):
    if not stats:
        stats = {"optimizations": 14, "lines_reduced": 28.4, "bugs_prevented": 3, "top_platform": "CodeChef"}
    heading = "Your Weekly Code Optimization Digest"
    badge_html = '<span class="badge badge-emerald">WEEKLY TELEMETRY</span>'
    content = f"""
    <p>Here is your weekly summary of code simplifications and performance gains achieved with <span class="highlight">Snipy</span>:</p>
    
    <div class="metric-card">
      <div class="metric-row">
        <span class="metric-label">Algorithms Optimized</span>
        <span class="metric-val">{stats.get('optimizations', 0)} routines</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Average Line Reduction</span>
        <span class="metric-val" style="color: #34d399;">-{stats.get('lines_reduced', 0)}% cleaner</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Syntax Errors Caught Early</span>
        <span class="metric-val">{stats.get('bugs_prevented', 0)} bugs</span>
      </div>
      <div class="metric-row">
        <span class="metric-label">Most Active Editor</span>
        <span class="metric-val">{stats.get('top_platform', 'IDE')}</span>
      </div>
    </div>
    
    <p>Keep eliminating artificial over-engineering and writing concise, idiomatic Python code!</p>
    """
    return BASE_EMAIL_SHELL.format(
        subject="Your Snipy Weekly Telemetry Digest 📊",
        heading=heading,
        badge_html=badge_html,
        user_name=user_name,
        content_body=content,
        cta_url=f"{APP_URL}/dashboard",
        cta_text="View Detailed Analytics",
        btn_class="",
        logo_url=LOGO_URL,
        app_url=APP_URL
    )

# ==============================================================================
# RESEND HTTP API CONFIGURATION (PORT 443 — CLOUD COMPATIBLE)
# ==============================================================================
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")

# ==============================================================================
# ASYNC EMAIL SENDER (NON-BLOCKING)
# ==============================================================================
def _send_email_worker(to_email, subject, html_content):
    if not to_email:
        logger.warning("Attempted to send email with empty recipient.")
        return

    # 1. Primary Strategy: Resend HTTPS REST API (Port 443 — Never blocked by Render firewall)
    if RESEND_API_KEY:
        try:
            import requests
            res = requests.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {RESEND_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "from": "Snipy AI <onboarding@resend.dev>",
                    "to": [to_email],
                    "subject": subject,
                    "html": html_content
                },
                timeout=12
            )
            if res.status_code in (200, 201):
                data = res.json() or {}
                logger.info(f"Successfully dispatched email via Resend API to {to_email} (ID: {data.get('id')})")
                return
            else:
                logger.warning(f"Resend API returned status {res.status_code}: {res.text}. Trying SMTP fallback...")
        except Exception as resend_err:
            logger.warning(f"Resend HTTP delivery notice: {resend_err}. Trying SMTP fallback...")

    # 2. Secondary Strategy: Direct SMTP Sockets (Fallback)
    if not SMTP_PASSWORD:
        logger.info(f"[DEV MODE / NO SMTP KEY] Email prepared for {to_email}: '{subject}'. Delivery skipped.")
        return

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{SENDER_NAME} <{SENDER_EMAIL}>"
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=12)
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SENDER_EMAIL, [to_email], msg.as_string())
        server.quit()
        logger.info(f"Successfully dispatched email '{subject}' to {to_email} via SMTP")
    except Exception as e:
        logger.error(f"Failed to dispatch email to {to_email} via {SMTP_HOST}:{SMTP_PORT}: {e}")

def dispatch_email_async(to_email, subject, html_content):
    """Spawns a daemon thread so the API request is never delayed by SMTP latency."""
    t = threading.Thread(target=_send_email_worker, args=(to_email, subject, html_content), daemon=True)
    t.start()

def send_welcome_email(to_email, user_name="Developer"):
    html = render_welcome_email(user_name)
    dispatch_email_async(to_email, "Welcome to Snipy! Start writing clean code", html)

def send_quota_exhausted_email(to_email, user_name="Developer", problems_fixed=30, lines_saved=68):
    html = render_quota_exhausted_email(user_name, problems_fixed, lines_saved)
    dispatch_email_async(to_email, "[Action Required] Your Snipy Free Quota is Exhausted (30/30 Fixed)", html)

def send_pro_activated_email(to_email, user_name="Developer", tx_id="TXN_SNIPY_101", amount=49):
    html = render_pro_activated_email(user_name, tx_id, amount)
    dispatch_email_async(to_email, "Payment Confirmed: Snipy Pro is now Active on your Account! 🚀", html)

def send_weekly_digest_email(to_email, user_name="Developer", stats=None):
    html = render_weekly_digest_email(user_name, stats)
    dispatch_email_async(to_email, "Your Snipy Weekly Telemetry Digest 📊", html)
