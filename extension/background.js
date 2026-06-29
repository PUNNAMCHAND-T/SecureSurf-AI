/**
 * SecureSurf AI - Background Service Worker
 * Handles URL scanning, notifications, and extension lifecycle.
 */

const API_BASE = 'http://localhost:8000';

// ===================== State Management =====================
let scanHistory = [];
let settings = {
  autoScan: true,
  showNotifications: true,
  apiUrl: API_BASE,
};

// Load settings from storage on startup
chrome.storage.local.get(['settings', 'scanHistory'], (result) => {
  if (result.settings) settings = { ...settings, ...result.settings };
  if (result.scanHistory) scanHistory = result.scanHistory;
});

// ===================== URL Scanning =====================

/**
 * Scan a URL using the SecureSurf AI API.
 * @param {string} url - The URL to scan
 * @returns {Promise<object>} Scan result
 */
async function scanUrl(url) {
  try {
    const response = await fetch(`${settings.apiUrl}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const result = await response.json();

    // Add to local history
    const historyEntry = {
      ...result,
      scannedAt: new Date().toISOString(),
      tabUrl: url,
    };
    
    scanHistory.unshift(historyEntry);
    
    // Keep only last 100 entries
    if (scanHistory.length > 100) {
      scanHistory = scanHistory.slice(0, 100);
    }
    
    // Save to storage
    chrome.storage.local.set({ scanHistory });

    // Show notification for high-risk URLs
    if (settings.showNotifications && result.risk_level !== 'safe' && result.risk_level !== 'low') {
      showNotification(result);
    }

    return result;
  } catch (error) {
    console.error('SecureSurf AI scan error:', error);
    return {
      url,
      prediction: 'error',
      error: error.message,
      confidence: 0,
      risk_level: 'unknown',
    };
  }
}

/**
 * Show a browser notification for risky URLs.
 * @param {object} result - Scan result
 */
function showNotification(result) {
  const riskEmoji = {
    critical: '🚨',
    high: '⚠️',
    medium: '⚡',
  };

  const emoji = riskEmoji[result.risk_level] || '⚡';
  
  chrome.notifications.create(`scan-${Date.now()}`, {
    type: 'basic',
    iconUrl: 'icons/icon128.png',
    title: `${emoji} SecureSurf AI - ${result.risk_level.toUpperCase()} Risk`,
    message: `URL: ${result.url.substring(0, 80)}...\nRisk: ${result.risk_level}\nConfidence: ${result.confidence}%`,
    priority: result.risk_level === 'critical' ? 2 : 1,
  });
}

// ===================== Tab Monitoring =====================

// Auto-scan on tab update (when URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (settings.autoScan && changeInfo.status === 'complete' && tab.url) {
    // Skip internal Chrome pages
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return;
    }
    
    // Skip already scanned URLs (within last 5 minutes)
    const recentScan = scanHistory.find(
      (entry) =>
        entry.url === tab.url &&
        new Date() - new Date(entry.scannedAt) < 5 * 60 * 1000
    );
    
    if (!recentScan) {
      scanUrl(tab.url).then((result) => {
        // Send result to content script
        chrome.tabs.sendMessage(tabId, {
          type: 'SCAN_RESULT',
          data: result,
        }).catch(() => {
          // Content script may not be ready
        });
      });
    }
  }
});

// ===================== Message Handling =====================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'SCAN_URL':
      scanUrl(message.url).then(sendResponse);
      return true; // Keep message channel open for async response
    
    case 'GET_HISTORY':
      sendResponse({ history: scanHistory.slice(0, message.limit || 20) });
      return false;
    
    case 'CLEAR_HISTORY':
      scanHistory = [];
      chrome.storage.local.set({ scanHistory: [] });
      sendResponse({ success: true });
      return false;
    
    case 'UPDATE_SETTINGS':
      settings = { ...settings, ...message.settings };
      chrome.storage.local.set({ settings });
      sendResponse({ success: true, settings });
      return false;
    
    case 'GET_SETTINGS':
      sendResponse({ settings });
      return false;
    
    default:
      sendResponse({ error: 'Unknown message type' });
      return false;
  }
});

console.log('SecureSurf AI Background Service Worker initialized.');
