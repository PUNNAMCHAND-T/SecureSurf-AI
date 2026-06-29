/**
 * SecureSurf AI - Content Script
 * Displays smart, attention-grabbing floating alerts when phishing is detected.
 */

// Inject global styles once
const styleTag = document.createElement('style');
styleTag.textContent = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

  @keyframes ss-slideIn {
    from { opacity: 0; transform: translateY(-30px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0)   scale(1);    }
  }
  @keyframes ss-slideOut {
    from { opacity: 1; transform: translateY(0)   scale(1);    }
    to   { opacity: 0; transform: translateY(-30px) scale(0.95); }
  }
  @keyframes ss-pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.15); }
  }
  @keyframes ss-glow {
    0%, 100% { box-shadow: 0 0 16px 2px rgba(255,60,60,0.45), 0 8px 32px rgba(0,0,0,0.22); }
    50%       { box-shadow: 0 0 32px 8px rgba(255,60,60,0.7),  0 8px 32px rgba(0,0,0,0.28); }
  }
  @keyframes ss-glow-orange {
    0%, 100% { box-shadow: 0 0 16px 2px rgba(255,152,0,0.4), 0 8px 32px rgba(0,0,0,0.18); }
    50%       { box-shadow: 0 0 28px 6px rgba(255,152,0,0.65), 0 8px 32px rgba(0,0,0,0.24); }
  }

  #securesurf-alert-card {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2147483647;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    animation: ss-slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards;
    min-width: 360px;
    max-width: 480px;
    border-radius: 16px;
    overflow: hidden;
    cursor: default;
  }
  #securesurf-alert-card.ss-exit {
    animation: ss-slideOut 0.25s ease-in forwards;
  }
  .ss-card-critical {
    background: linear-gradient(135deg, #1a0000 0%, #3d0000 100%);
    border: 1.5px solid rgba(255,80,80,0.5);
    animation: ss-slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards, ss-glow 2s ease-in-out infinite 0.35s;
  }
  .ss-card-medium {
    background: linear-gradient(135deg, #1a0e00 0%, #3d2000 100%);
    border: 1.5px solid rgba(255,160,0,0.5);
    animation: ss-slideIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards, ss-glow-orange 2.5s ease-in-out infinite 0.35s;
  }
  .ss-inner {
    padding: 18px 20px 16px 20px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ss-top-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .ss-icon-wrap {
    width: 46px;
    height: 46px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
    flex-shrink: 0;
    animation: ss-pulse 1.8s ease-in-out infinite;
  }
  .ss-icon-critical { background: rgba(255,60,60,0.18); border: 2px solid rgba(255,80,80,0.5); }
  .ss-icon-medium   { background: rgba(255,160,0,0.15); border: 2px solid rgba(255,160,0,0.5); }
  .ss-text-block { flex: 1; }
  .ss-brand {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    margin-bottom: 3px;
  }
  .ss-brand-critical { color: rgba(255,120,120,0.9); }
  .ss-brand-medium   { color: rgba(255,180,60,0.9);  }
  .ss-title {
    font-size: 15px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
  }
  .ss-subtitle {
    font-size: 12px;
    color: rgba(255,255,255,0.65);
    margin-top: 3px;
  }
  .ss-dismiss {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.15);
    color: rgba(255,255,255,0.6);
    border-radius: 8px;
    width: 30px;
    height: 30px;
    font-size: 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s;
    align-self: flex-start;
  }
  .ss-dismiss:hover { background: rgba(255,255,255,0.18); color: #fff; }
  .ss-divider {
    height: 1px;
    background: rgba(255,255,255,0.08);
    margin: 0 -20px;
  }
  .ss-actions {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  .ss-btn-back {
    flex: 1;
    padding: 9px 0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: rgba(255,60,60,0.8);
    color: #fff;
    transition: background 0.2s;
    letter-spacing: 0.3px;
  }
  .ss-btn-back:hover { background: rgba(255,60,60,1); }
  .ss-btn-proceed {
    flex: 1;
    padding: 9px 0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.18);
    color: rgba(255,255,255,0.75);
    transition: background 0.2s, color 0.2s;
    letter-spacing: 0.3px;
  }
  .ss-btn-proceed:hover { background: rgba(255,255,255,0.15); color: #fff; }
  .ss-confidence-bar {
    height: 4px;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    overflow: hidden;
    margin-top: 2px;
  }
  .ss-confidence-fill-critical {
    height: 100%;
    background: linear-gradient(90deg, #ff6b6b, #ff0000);
    border-radius: 4px;
    transition: width 0.8s ease;
  }
  .ss-confidence-fill-medium {
    height: 100%;
    background: linear-gradient(90deg, #ffd060, #ff9800);
    border-radius: 4px;
    transition: width 0.8s ease;
  }
`;
document.head.appendChild(styleTag);

// Listen for scan results from background worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCAN_RESULT') {
    const result = message.data;
    if (result.risk_level === 'high' || result.risk_level === 'critical') {
      showWarningBanner(result);
    } else if (result.risk_level === 'medium') {
      showCautionBanner(result);
    }
  }
});

/**
 * Display a floating card for high/critical risk URLs.
 */
function showWarningBanner(result) {
  removeBanner();

  const card = document.createElement('div');
  card.id = 'securesurf-alert-card';
  card.className = 'ss-card-critical';
  card.innerHTML = `
    <div class="ss-inner">
      <div class="ss-top-row">
        <div class="ss-icon-wrap ss-icon-critical">🚨</div>
        <div class="ss-text-block">
          <div class="ss-brand ss-brand-critical">⚡ SecureSurf AI · ${result.risk_level.toUpperCase()} RISK</div>
          <div class="ss-title">Phishing Website Detected</div>
          <div class="ss-subtitle">AI Confidence: <strong style="color:#ff8080">${result.confidence}%</strong></div>
          <div class="ss-confidence-bar" style="margin-top:6px">
            <div class="ss-confidence-fill-critical" style="width:${result.confidence}%"></div>
          </div>
        </div>
        <button class="ss-dismiss" id="ss-dismiss-btn" title="Dismiss">✕</button>
      </div>
      <div class="ss-divider"></div>
      <div class="ss-actions">
        <button class="ss-btn-back" onclick="window.history.back()">← Go Back (Safe)</button>
        <button class="ss-btn-proceed" id="ss-proceed-btn">Proceed Anyway</button>
      </div>
    </div>
  `;

  document.body.prepend(card);
  document.getElementById('ss-dismiss-btn')?.addEventListener('click', removeBanner);
  document.getElementById('ss-proceed-btn')?.addEventListener('click', removeBanner);
}

/**
 * Display a floating card for medium-risk URLs.
 */
function showCautionBanner(result) {
  removeBanner();

  const card = document.createElement('div');
  card.id = 'securesurf-alert-card';
  card.className = 'ss-card-medium';
  card.innerHTML = `
    <div class="ss-inner">
      <div class="ss-top-row">
        <div class="ss-icon-wrap ss-icon-medium">⚠️</div>
        <div class="ss-text-block">
          <div class="ss-brand ss-brand-medium">⚡ SecureSurf AI · MEDIUM RISK</div>
          <div class="ss-title">Proceed with Caution</div>
          <div class="ss-subtitle">AI Confidence: <strong style="color:#ffd060">${result.confidence}%</strong></div>
          <div class="ss-confidence-bar" style="margin-top:6px">
            <div class="ss-confidence-fill-medium" style="width:${result.confidence}%"></div>
          </div>
        </div>
        <button class="ss-dismiss" id="ss-dismiss-btn" title="Dismiss">✕</button>
      </div>
    </div>
  `;

  document.body.prepend(card);
  document.getElementById('ss-dismiss-btn')?.addEventListener('click', removeBanner);
}

/**
 * Smoothly remove the alert card.
 */
function removeBanner() {
  const existing = document.getElementById('securesurf-alert-card');
  if (existing) {
    existing.classList.add('ss-exit');
    setTimeout(() => existing.remove(), 260);
  }
}
