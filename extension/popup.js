/**
 * SecureSurf AI - Popup Script
 * Handles UI interactions, API communication, and state management.
 */

document.addEventListener('DOMContentLoaded', () => {
  // ===================== DOM Elements =====================
  const elements = {
    // Tabs
    tabScanner: document.getElementById('tabScanner'),
    tabHistory: document.getElementById('tabHistory'),
    tabSettings: document.getElementById('tabSettings'),
    scannerTab: document.getElementById('scannerTab'),
    historyTab: document.getElementById('historyTab'),
    settingsTab: document.getElementById('settingsTab'),
    
    // Scanner
    currentUrl: document.getElementById('currentUrl'),
    scanBtn: document.getElementById('scanBtn'),
    resultsSection: document.getElementById('resultsSection'),
    loadingState: document.getElementById('loadingState'),
    errorState: document.getElementById('errorState'),
    errorText: document.getElementById('errorText'),
    retryBtn: document.getElementById('retryBtn'),
    
    // Results
    statusCard: document.getElementById('statusCard'),
    statusIcon: document.getElementById('statusIcon'),
    statusText: document.getElementById('statusText'),
    statusConfidence: document.getElementById('statusConfidence'),
    riskFill: document.getElementById('riskFill'),
    riskText: document.getElementById('riskText'),
    featureList: document.getElementById('featureList'),
    reportFalsePositive: document.getElementById('reportFalsePositive'),
    
    // History
    historyList: document.getElementById('historyList'),
    clearHistoryBtn: document.getElementById('clearHistoryBtn'),
    
    // Settings
    autoScanToggle: document.getElementById('autoScanToggle'),
    notificationsToggle: document.getElementById('notificationsToggle'),
    apiUrlInput: document.getElementById('apiUrlInput'),
    saveSettingsBtn: document.getElementById('saveSettingsBtn'),
    
    // Status
    statusDot: document.getElementById('statusDot'),
  };

  let currentTabUrl = '';

  // ===================== Tab Navigation =====================
  const tabButtons = document.querySelectorAll('.nav-tab');
  const tabContents = {
    scanner: elements.scannerTab,
    history: elements.historyTab,
    settings: elements.settingsTab,
  };

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active tab
      tabButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Show content
      Object.values(tabContents).forEach((t) => (t.style.display = 'none'));
      tabContents[tab].style.display = 'block';
      
      // Load history when switching to history tab
      if (tab === 'history') loadHistory();
    });
  });

  // ===================== Get Current Tab URL =====================
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url) {
      currentTabUrl = tabs[0].url;
      elements.currentUrl.textContent = currentTabUrl;
    } else {
      elements.currentUrl.textContent = 'Unable to get current page URL';
    }
  });

  // ===================== Scan URL =====================
  elements.scanBtn.addEventListener('click', () => {
    if (!currentTabUrl || currentTabUrl.startsWith('chrome://')) {
      showError('Cannot scan internal Chrome pages');
      return;
    }
    scanUrl(currentTabUrl);
  });

  elements.retryBtn.addEventListener('click', () => {
    if (currentTabUrl) scanUrl(currentTabUrl);
  });

  async function scanUrl(url) {
    showLoading();
    
    chrome.runtime.sendMessage(
      { type: 'SCAN_URL', url },
      (response) => {
        if (response && !response.error) {
          showResults(response);
        } else {
          showError(response?.error || 'Failed to scan URL. Is the backend running?');
        }
      }
    );
  }

  // ===================== Display States =====================
  function showLoading() {
    elements.resultsSection.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.loadingState.style.display = 'block';
    elements.scanBtn.disabled = true;
  }

  function showResults(result) {
    elements.loadingState.style.display = 'none';
    elements.errorState.style.display = 'none';
    elements.resultsSection.style.display = 'block';
    elements.scanBtn.disabled = false;

    // Status card
    const isPhishing = result.is_phishing;
    const risk = result.risk_level;
    
    let cardClass, icon, text;
    if (risk === 'safe' || risk === 'low') {
      cardClass = 'safe';
      icon = '✅';
      text = 'Safe Website';
    } else if (risk === 'medium') {
      cardClass = 'suspicious';
      icon = '⚠️';
      text = 'Suspicious Website';
    } else {
      cardClass = 'phishing';
      icon = '🚨';
      text = 'Phishing Website';
    }

    elements.statusCard.className = `status-card ${cardClass}`;
    elements.statusIcon.textContent = icon;
    elements.statusText.textContent = text;
    elements.statusConfidence.textContent = `Confidence: ${result.confidence}%`;

    // Risk bar
    const riskPercent = result.phishing_probability || 0;
    elements.riskFill.style.width = `${riskPercent}%`;
    elements.riskFill.className = `risk-fill ${risk}`;
    elements.riskText.textContent = `${risk} (${riskPercent}%)`;

    // SHAP features
    elements.featureList.innerHTML = '';
    const topFeatures = result.shap_explanation?.top_features || [];
    
    topFeatures.slice(0, 6).forEach((feat) => {
      const item = document.createElement('div');
      item.className = 'feature-item';
      
      const isPositive = feat.impact === 'increases_phishing';
      const impactClass = isPositive ? 'positive' : 'negative';
      const impactText = isPositive ? '⬆ Risk' : '⬇ Risk';
      const featureName = feat.description || feat.feature.replace(/_/g, ' ');
      
      item.innerHTML = `
        <span class="feature-name">${featureName}</span>
        <span class="feature-impact ${impactClass}">${impactText}</span>
      `;
      
      elements.featureList.appendChild(item);
    });
  }

  function showError(message) {
    elements.loadingState.style.display = 'none';
    elements.resultsSection.style.display = 'none';
    elements.errorState.style.display = 'block';
    elements.errorText.textContent = message;
    elements.scanBtn.disabled = false;
  }

  // ===================== History =====================
  function loadHistory() {
    chrome.runtime.sendMessage({ type: 'GET_HISTORY', limit: 20 }, (response) => {
      const history = response?.history || [];
      
      if (history.length === 0) {
        elements.historyList.innerHTML = '<p class="empty-state">No scan history yet</p>';
        return;
      }
      
      elements.historyList.innerHTML = '';
      history.forEach((entry) => {
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const statusClass = entry.is_phishing ? 'phishing' : 'safe';
        const displayUrl = entry.url.length > 40 
          ? entry.url.substring(0, 40) + '...' 
          : entry.url;
        
        item.innerHTML = `
          <div class="history-status-dot ${statusClass}"></div>
          <span class="history-url" title="${entry.url}">${displayUrl}</span>
          <span class="history-confidence">${entry.confidence}%</span>
        `;
        
        elements.historyList.appendChild(item);
      });
    });
  }

  elements.clearHistoryBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'CLEAR_HISTORY' }, () => {
      elements.historyList.innerHTML = '<p class="empty-state">No scan history yet</p>';
    });
  });

  // ===================== Settings =====================
  // Load settings
  chrome.runtime.sendMessage({ type: 'GET_SETTINGS' }, (response) => {
    if (response?.settings) {
      elements.autoScanToggle.checked = response.settings.autoScan;
      elements.notificationsToggle.checked = response.settings.showNotifications;
      elements.apiUrlInput.value = response.settings.apiUrl || 'http://localhost:8000';
    }
  });

  elements.saveSettingsBtn.addEventListener('click', () => {
    const settings = {
      autoScan: elements.autoScanToggle.checked,
      showNotifications: elements.notificationsToggle.checked,
      apiUrl: elements.apiUrlInput.value.trim(),
    };
    
    chrome.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings }, (response) => {
      if (response?.success) {
        elements.saveSettingsBtn.textContent = '✓ Saved!';
        setTimeout(() => {
          elements.saveSettingsBtn.textContent = 'Save Settings';
        }, 2000);
      }
    });
  });

  // ===================== Report =====================
  elements.reportFalsePositive.addEventListener('click', () => {
    if (currentTabUrl) {
      const reportType = confirm(
        'Is this a false positive? (A legitimate site marked as phishing)\n\nOK = False Positive\nCancel = Report as Phishing'
      ) ? 'false_positive' : 'phishing';
      
      // Send report to background
      fetch(`${elements.apiUrlInput.value}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentTabUrl,
          report_type: reportType,
          description: `Reported via extension`,
        }),
      }).then(() => {
        elements.reportFalsePositive.textContent = '✓ Reported';
        setTimeout(() => {
          elements.reportFalsePositive.textContent = '🚩 Report';
        }, 3000);
      }).catch(() => {
        elements.reportFalsePositive.textContent = '❌ Failed';
        setTimeout(() => {
          elements.reportFalsePositive.textContent = '🚩 Report';
        }, 3000);
      });
    }
  });

  // ===================== API Health Check =====================
  async function checkApiHealth() {
    try {
      const apiUrl = elements.apiUrlInput.value || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/health`, { 
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });
      
      if (response.ok) {
        elements.statusDot.classList.remove('offline');
        elements.statusDot.title = 'API Connected';
      } else {
        elements.statusDot.classList.add('offline');
        elements.statusDot.title = 'API Error';
      }
    } catch {
      elements.statusDot.classList.add('offline');
      elements.statusDot.title = 'API Offline';
    }
  }

  checkApiHealth();
});
