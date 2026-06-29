import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart3, TrendingUp, Shield, AlertTriangle, Activity, Target, RefreshCw
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { getStats, getModelInfo, listPlots } from '../services/api'
import './Analytics.css'

const COLORS = {
  safe: '#22c55e',
  low: '#84cc16',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
  primary: '#667eea',
  secondary: '#764ba2',
}

const PIE_COLORS = ['#22c55e', '#ef4444']

export default function Analytics() {
  const [stats, setStats] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsData, modelData, plotsData] = await Promise.all([
        getStats().catch(() => null),
        getModelInfo().catch(() => null),
        listPlots().catch(() => ({ plots: [] })),
      ])
      setStats(statsData)
      setModelInfo(modelData)
      setPlots(plotsData?.plots || [])
    } catch (err) {
      console.error('Analytics error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container analytics-page">
          <div className="analytics-loading">
            <div className="loading-spinner" />
            <p>Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const predictionData = [
    { name: 'Safe', value: stats?.predictions?.safe || 0, fill: COLORS.safe },
    { name: 'Phishing', value: stats?.predictions?.phishing || 0, fill: COLORS.critical },
  ]

  const riskData = ['safe', 'low', 'medium', 'high', 'critical'].map(level => ({
    name: level.charAt(0).toUpperCase() + level.slice(1),
    value: stats?.risk_levels?.[level] || 0,
    fill: COLORS[level],
  }))

  const trendData = (stats?.daily_trend || []).map(d => ({
    date: d.date?.slice(5) || '',
    total: d.total,
    phishing: d.phishing,
    safe: d.total - d.phishing,
  }))

  // Model performance data
  const modelMetrics = modelInfo?.all_model_metrics || {}
  const modelComparisonData = Object.entries(modelMetrics).map(([name, metrics]) => ({
    name: name.replace('Classifier', '').trim(),
    accuracy: (metrics.accuracy * 100).toFixed(1),
    precision: (metrics.precision * 100).toFixed(1),
    recall: (metrics.recall * 100).toFixed(1),
    f1: (metrics.f1_score * 100).toFixed(1),
    roc_auc: (metrics.roc_auc * 100).toFixed(1),
  }))

  // Radar chart data for best model
  const bestMetrics = modelInfo?.metrics || {}
  const radarData = [
    { metric: 'Accuracy', value: (bestMetrics.accuracy || 0) * 100 },
    { metric: 'Precision', value: (bestMetrics.precision || 0) * 100 },
    { metric: 'Recall', value: (bestMetrics.recall || 0) * 100 },
    { metric: 'F1 Score', value: (bestMetrics.f1_score || 0) * 100 },
    { metric: 'ROC-AUC', value: (bestMetrics.roc_auc || 0) * 100 },
  ]

  return (
    <div className="page-wrapper">
      <div className="container analytics-page">
        {/* Header */}
        <motion.div
          className="analytics-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="page-title">
              <BarChart3 size={28} />
              Analytics Dashboard
            </h1>
            <p className="page-desc">
              Monitor scan activity, model performance, and threat landscape.
            </p>
          </div>
          <button className="refresh-btn" onClick={fetchData}>
            <RefreshCw size={16} />
            Refresh
          </button>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          className="kpi-grid"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <KPICard
            icon={Activity}
            label="Total Scans"
            value={stats?.total_scans || 0}
            color="#667eea"
          />
          <KPICard
            icon={Shield}
            label="Safe URLs"
            value={stats?.predictions?.safe || 0}
            color="#22c55e"
          />
          <KPICard
            icon={AlertTriangle}
            label="Phishing Detected"
            value={stats?.predictions?.phishing || 0}
            color="#ef4444"
          />
          <KPICard
            icon={Target}
            label="Avg Confidence"
            value={`${stats?.avg_confidence || 0}%`}
            color="#f59e0b"
          />
        </motion.div>

        {/* Charts Row 1 */}
        <div className="charts-grid">
          {/* Prediction Distribution */}
          <motion.div
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="chart-title">Prediction Distribution</h3>
            {predictionData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={predictionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {predictionData.map((entry, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '13px', color: '#9ca3af' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No scan data available yet</div>
            )}
          </motion.div>

          {/* Risk Level Distribution */}
          <motion.div
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <h3 className="chart-title">Risk Level Breakdown</h3>
            {riskData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={riskData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e7eb',
                      fontSize: '13px',
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {riskData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-empty">No risk data available yet</div>
            )}
          </motion.div>
        </div>

        {/* Scan Trend */}
        {trendData.length > 0 && (
          <motion.div
            className="chart-card chart-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="chart-title">
              <TrendingUp size={18} />
              Scan Activity (Last 7 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#e5e7eb',
                    fontSize: '13px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '13px' }} />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#667eea"
                  strokeWidth={2}
                  dot={{ fill: '#667eea', r: 4 }}
                  name="Total Scans"
                />
                <Line
                  type="monotone"
                  dataKey="phishing"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  name="Phishing"
                />
                <Line
                  type="monotone"
                  dataKey="safe"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  name="Safe"
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Model Performance */}
        <div className="charts-grid">
          {/* Model Comparison */}
          {modelComparisonData.length > 0 && (
            <motion.div
              className="chart-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <h3 className="chart-title">Model Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={modelComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" domain={[80, 100]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#9ca3af', fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e7eb',
                      fontSize: '12px',
                    }}
                    formatter={(val) => `${val}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="accuracy" fill="#667eea" name="Accuracy" radius={[0, 3, 3, 0]} barSize={8} />
                  <Bar dataKey="f1" fill="#764ba2" name="F1 Score" radius={[0, 3, 3, 0]} barSize={8} />
                  <Bar dataKey="roc_auc" fill="#22c55e" name="ROC-AUC" radius={[0, 3, 3, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Radar Chart */}
          {radarData.some(d => d.value > 0) && (
            <motion.div
              className="chart-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="chart-title">
                Best Model: {modelInfo?.best_model_name || 'N/A'}
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.08)" />
                  <PolarAngleAxis
                    dataKey="metric"
                    tick={{ fill: '#9ca3af', fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#667eea"
                    fill="#667eea"
                    fillOpacity={0.2}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e5e7eb',
                    }}
                    formatter={(val) => `${val.toFixed(1)}%`}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Model Metrics Table */}
        {modelComparisonData.length > 0 && (
          <motion.div
            className="chart-card chart-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <h3 className="chart-title">Detailed Model Metrics</h3>
            <div className="metrics-table-wrap">
              <table className="metrics-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Accuracy</th>
                    <th>Precision</th>
                    <th>Recall</th>
                    <th>F1 Score</th>
                    <th>ROC-AUC</th>
                  </tr>
                </thead>
                <tbody>
                  {modelComparisonData.map((m) => (
                    <tr key={m.name}>
                      <td className="model-name">{m.name}</td>
                      <td><MetricBadge value={m.accuracy} /></td>
                      <td><MetricBadge value={m.precision} /></td>
                      <td><MetricBadge value={m.recall} /></td>
                      <td><MetricBadge value={m.f1} /></td>
                      <td><MetricBadge value={m.roc_auc} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* No model data info */}
        {!modelInfo?.all_model_metrics && (
          <div className="chart-card chart-full">
            <div className="chart-empty" style={{ padding: '40px' }}>
              <h3>Model Performance Data</h3>
              <p>Train the ML model to see performance comparison charts.</p>
              <code style={{ color: 'var(--accent-primary)', marginTop: '8px', display: 'block' }}>
                cd model && python train_model.py
              </code>
            </div>
          </div>
        )}

        {/* ---- Model Visualizations (Generated Plots) ---- */}
        {plots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="section-header" style={{ marginBottom: '16px' }}>
              <h2 className="chart-title" style={{ fontSize: '18px' }}>
                📊 Training Visualizations
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                Plots generated during the last model training run.
              </p>
            </div>
            <div className="plots-grid">
              {plots.map((plot) => (
                <PlotCard key={plot} filename={plot} />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function KPICard({ icon: Icon, label, value, color }) {
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: `${color}15`, color }}>
        <Icon size={22} />
      </div>
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
    </div>
  )
}

function MetricBadge({ value }) {
  const num = parseFloat(value)
  let color = '#22c55e'
  if (num < 90) color = '#f59e0b'
  if (num < 80) color = '#ef4444'

  return (
    <span className="metric-badge" style={{ color, background: `${color}12` }}>
      {value}%
    </span>
  )
}

/**
 * PlotCard — Displays a training visualization PNG from the backend.
 * Clicking opens the image fullscreen.
 */
function PlotCard({ filename }) {
  const [expanded, setExpanded] = useState(false)
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  const src = `${API_BASE}/static/plots/${filename}`

  const title = filename
    .replace('.png', '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <>
      <div className="plot-card" onClick={() => setExpanded(true)} title="Click to enlarge">
        <div className="plot-card-header">
          <span className="plot-title">{title}</span>
          <span className="plot-expand">⤢</span>
        </div>
        <img
          src={src}
          alt={title}
          className="plot-img"
          loading="lazy"
          onError={(e) => { e.target.style.display = 'none' }}
        />
      </div>

      {/* Fullscreen lightbox */}
      {expanded && (
        <div className="plot-lightbox" onClick={() => setExpanded(false)}>
          <div className="plot-lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button className="plot-close" onClick={() => setExpanded(false)}>✕</button>
            <p className="plot-lightbox-title">{title}</p>
            <img src={src} alt={title} className="plot-img-full" />
          </div>
        </div>
      )}
    </>
  )
}
