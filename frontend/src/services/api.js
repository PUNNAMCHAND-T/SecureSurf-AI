/**
 * API service for communicating with SecureSurf AI backend.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Scan a URL for phishing detection.
 * @param {string} url - URL to scan
 * @returns {Promise<object>} Prediction result
 */
export async function scanUrl(url) {
  const response = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get scan history.
 * @param {object} params - Query parameters
 * @returns {Promise<object>} History data
 */
export async function getHistory(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE}/history?${query}`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Report a URL.
 * @param {object} report - Report data
 * @returns {Promise<object>} Report response
 */
export async function reportUrl(report) {
  const response = await fetch(`${API_BASE}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(report),
  });
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get analytics statistics.
 * @returns {Promise<object>} Stats data
 */
export async function getStats() {
  const response = await fetch(`${API_BASE}/stats`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Get model information.
 * @returns {Promise<object>} Model metadata
 */
export async function getModelInfo() {
  const response = await fetch(`${API_BASE}/model-info`);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }
  
  return response.json();
}

/**
 * Check API health.
 * @returns {Promise<boolean>} API health status
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, {
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * List available training visualization plots.
 * @returns {Promise<object>} List of plot filenames
 */
export async function listPlots() {
  const response = await fetch(`${API_BASE}/plots/list`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return response.json()
}
