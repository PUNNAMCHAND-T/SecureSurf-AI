import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Shield, AlertTriangle, XCircle, CheckCircle, ArrowRight, Loader2, Flag, BarChart2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { scanUrl, reportUrl } from '../services/api'
import './Scanner.css'

export default function Scanner() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleScan = async (e) => {
    e.preventDefault()
    if (!url.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await scanUrl(url.trim())
      setResult(data)
    } catch (err) {
      setError(err.message || 'Failed to scan URL. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }

  const handleReport = async (type) => {
    if (!result) return
    try {
      await reportUrl({
        url: result.url,
        report_type: type,
        description: `Reported via dashboard as ${type}`,
      })
      showToast(`URL reported as "${type}". Thank you!`, 'success')
    } catch {
      showToast('Failed to submit report. Please try again.', 'error')
    }
  }

  const getRiskConfig = (level) => {
    const configs = {
      safe:     { color: '#22c55e', bg: 'rgba(34,197,94,0.08)',    icon: CheckCircle,  label: '✅ Safe Website',       barWidth: '10%' },
      low:      { color: '#84cc16', bg: 'rgba(132,204,22,0.08)',   icon: CheckCircle,  label: '✅ Low Risk',           barWidth: '25%' },
      medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',   icon: AlertTriangle, label: '⚠️ Suspicious',        barWidth: '50%' },
      high:     { color: '#f97316', bg: 'rgba(249,115,22,0.08)',   icon: AlertTriangle, label: '⚠️ High Risk',         barWidth: '75%' },
      critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)',    icon: XCircle,      label: '🚨 Phishing Detected',  barWidth: '95%' },
    }
    return configs[level] || configs.safe
  }

  return (
    <div className="page-wrapper">
      <div className="container scanner-page">

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              className={`scanner-toast scanner-toast--${toast.type}`}
              initial={{ opacity: 0, x: 80, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 80 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <span className="scanner-toast-icon">
                {toast.type === 'success' ? '✅' : '❌'}
              </span>
              <span className="scanner-toast-msg">{toast.message}</span>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Header */}
        <motion.div
          className="scanner-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="page-title">
            <Search size={28} />
            URL Scanner
          </h1>
          <p className="page-desc">
            Enter any URL below to analyze it for phishing indicators using SecureSurf AI's multi-model detection.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.form
          className="scanner-form"
          onSubmit={handleScan}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <div className="scanner-input-group">
            <Shield className="scanner-input-icon" size={20} />
            <input
              id="url-input"
              type="text"
              className="scanner-input"
              placeholder="Enter URL to scan (e.g., https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
              autoFocus
            />
            <button
              id="scan-button"
              type="submit"
              className="scanner-submit"
              disabled={loading || !url.trim()}
            >
              {loading ? (
                <Loader2 size={18} className="spin-icon" />
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Quick test URLs */}
          <div className="quick-urls">
            <span className="quick-label">Try:</span>
            {[
              'https://www.google.com',
              'http://login-verify.suspicious.tk/account',
              'https://github.com',
              'http://192.168.1.1/phishing/login.php',
            ].map((testUrl) => (
              <button
                key={testUrl}
                type="button"
                className="quick-url-btn"
                onClick={() => setUrl(testUrl)}
              >
                {testUrl.length > 35 ? testUrl.slice(0, 35) + '...' : testUrl}
              </button>
            ))}
          </div>
        </motion.form>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="scanner-error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <XCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              className="scanner-loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="loading-spinner" />
              <p>Analyzing URL with AI models...</p>
              <p className="loading-sub">Extracting features → Running prediction → Generating SHAP explanation</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              className="scanner-results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Main Result Card */}
              <ResultCard result={result} riskConfig={getRiskConfig(result.risk_level)} />

              {/* Details Grid */}
              <div className="result-details-grid">
                {/* Confidence Breakdown */}
                <div className="detail-card">
                  <h3 className="detail-title">📊 Confidence Breakdown</h3>
                  <div className="confidence-bars">
                    <div className="conf-bar-item">
                      <div className="conf-bar-header">
                        <span>Safe Probability</span>
                        <span className="conf-value safe">{result.safe_probability}%</span>
                      </div>
                      <div className="conf-bar">
                        <div className="conf-fill safe" style={{ width: `${result.safe_probability}%` }} />
                      </div>
                    </div>
                    <div className="conf-bar-item">
                      <div className="conf-bar-header">
                        <span>Phishing Probability</span>
                        <span className="conf-value danger">{result.phishing_probability}%</span>
                      </div>
                      <div className="conf-bar">
                        <div className="conf-fill danger" style={{ width: `${result.phishing_probability}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SHAP Explanation List */}
                <div className="detail-card">
                  <h3 className="detail-title">🧠 AI Explanation (SHAP)</h3>
                  <p className="detail-subtitle">
                    Top features influencing the prediction:
                  </p>
                  <div className="shap-features">
                    {(result.shap_explanation?.top_features || []).slice(0, 8).map((feat, i) => (
                      <div key={i} className="shap-feature">
                        <div className="shap-feature-info">
                          <span className="shap-rank">#{i + 1}</span>
                          <span className="shap-name">
                            {feat.description || feat.feature?.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span
                          className={`shap-impact ${
                            feat.impact === 'increases_phishing' ? 'danger' : 'safe'
                          }`}
                        >
                          {feat.impact === 'increases_phishing' ? '▲ Risk' : '▼ Safe'}
                        </span>
                      </div>
                    ))}
                    {(!result.shap_explanation?.top_features?.length) && (
                      <p className="no-features">No feature explanation available.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* SHAP Bar Chart — Full Width */}
              {result.shap_explanation?.top_features?.length > 0 && (
                <ShapBarChart features={result.shap_explanation.top_features} />
              )}

              {/* Report */}
              <div className="result-actions">
                <button className="action-btn report" onClick={() => handleReport('phishing')}>
                  <Flag size={14} />
                  Report as Phishing
                </button>
                <button className="action-btn false-pos" onClick={() => handleReport('false_positive')}>
                  <Flag size={14} />
                  Report False Positive
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

/* ---- SHAP Bar Chart Component ---- */
function ShapBarChart({ features }) {
  // Take top 10 features and format for recharts
  const chartData = features.slice(0, 10).map((feat) => ({
    name: (feat.description || feat.feature?.replace(/_/g, ' ') || 'Unknown').slice(0, 28),
    value: Math.round(Math.abs(feat.shap_value || feat.abs_impact || 0) * 100) / 100,
    isRisk: feat.impact === 'increases_phishing',
    rawValue: feat.shap_value || 0,
  })).sort((a, b) => b.value - a.value)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload
      return (
        <div className="shap-tooltip">
          <p className="shap-tooltip-name">{label}</p>
          <p className={`shap-tooltip-impact ${d.isRisk ? 'danger' : 'safe'}`}>
            {d.isRisk ? '▲ Increases phishing risk' : '▼ Decreases phishing risk'}
          </p>
          <p className="shap-tooltip-val">SHAP value: {d.value.toFixed(4)}</p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      className="detail-card shap-chart-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <h3 className="detail-title">
        <BarChart2 size={18} style={{ display: 'inline', marginRight: 8 }} />
        Feature Impact Chart (SHAP)
      </h3>
      <p className="detail-subtitle">
        Absolute SHAP values — larger bars = stronger influence on the prediction.
      </p>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#9ca3af', fontSize: 11 }}
            tickFormatter={(v) => v.toFixed(2)}
          />
          <YAxis
            dataKey="name"
            type="category"
            width={200}
            tick={{ fill: '#c4c9d9', fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={14}>
            {chartData.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.isRisk
                  ? `rgba(239, 68, 68, ${0.5 + (i === 0 ? 0.5 : (10 - i) / 20)})`
                  : `rgba(34, 197, 94, ${0.5 + (i === 0 ? 0.5 : (10 - i) / 20)})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

/* ---- Sub-component for the main result card ---- */
function ResultCard({ result, riskConfig }) {
  const Icon = riskConfig.icon
  return (
    <div className="result-card" style={{ borderColor: `${riskConfig.color}40` }}>
      <div className="result-card-left" style={{ background: riskConfig.bg }}>
        <Icon size={48} style={{ color: riskConfig.color }} />
        <div className="result-label" style={{ color: riskConfig.color }}>
          {riskConfig.label}
        </div>
        <div className="result-confidence">
          {result.confidence}% Confidence
        </div>
      </div>
      <div className="result-card-right">
        <div className="result-url-info">
          <span className="result-url-label">Scanned URL</span>
          <code className="result-url-value">{result.url}</code>
        </div>
        <div className="result-meta-grid">
          <div className="result-meta">
            <span className="meta-label">Prediction</span>
            <span className={`meta-value ${result.prediction}`}>{result.prediction.toUpperCase()}</span>
          </div>
          <div className="result-meta">
            <span className="meta-label">Risk Level</span>
            <span className="meta-value">{result.risk_level.toUpperCase()}</span>
          </div>
          <div className="result-meta">
            <span className="meta-label">Source</span>
            <span className="meta-value">{result.source || 'model'}</span>
          </div>
        </div>
        {/* Risk bar */}
        <div className="result-risk-bar">
          <div
            className="result-risk-fill"
            style={{
              width: riskConfig.barWidth,
              background: `linear-gradient(90deg, ${riskConfig.color}80, ${riskConfig.color})`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
