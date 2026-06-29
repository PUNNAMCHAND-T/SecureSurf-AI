import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Filter, ChevronLeft, ChevronRight, ExternalLink, Shield, AlertTriangle, XCircle } from 'lucide-react'
import { getHistory } from '../services/api'
import './History.css'

const ITEMS_PER_PAGE = 15

export default function History() {
  const [history, setHistory] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filterRisk, setFilterRisk] = useState('')
  const [filterPrediction, setFilterPrediction] = useState('')

  const fetchHistory = async () => {
    setLoading(true)
    try {
      const params = {
        limit: ITEMS_PER_PAGE,
        offset: page * ITEMS_PER_PAGE,
      }
      if (filterRisk) params.risk_level = filterRisk
      if (filterPrediction) params.prediction = filterPrediction

      const data = await getHistory(params)
      setHistory(data.history || [])
      setTotal(data.total || 0)
    } catch (err) {
      console.error('Error fetching history:', err)
      setHistory([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [page, filterRisk, filterPrediction])

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE)

  const getRiskBadge = (level) => {
    const styles = {
      safe: { bg: 'rgba(34,197,94,0.12)', color: '#4ade80', icon: Shield },
      low: { bg: 'rgba(132,204,22,0.12)', color: '#a3e635', icon: Shield },
      medium: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24', icon: AlertTriangle },
      high: { bg: 'rgba(249,115,22,0.12)', color: '#fb923c', icon: AlertTriangle },
      critical: { bg: 'rgba(239,68,68,0.12)', color: '#f87171', icon: XCircle },
    }
    return styles[level] || styles.safe
  }

  return (
    <div className="page-wrapper">
      <div className="container history-page">
        <motion.div
          className="history-header"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="page-title">
              <Clock size={28} />
              Scan History
            </h1>
            <p className="page-desc">
              View all previously scanned URLs with their results and risk assessments.
            </p>
          </div>
          <div className="history-count">{total} total scans</div>
        </motion.div>

        {/* Filters */}
        <motion.div
          className="history-filters"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="filter-group">
            <Filter size={14} />
            <span className="filter-label">Filters:</span>
          </div>

          <select
            id="filter-prediction"
            className="filter-select"
            value={filterPrediction}
            onChange={(e) => { setFilterPrediction(e.target.value); setPage(0); }}
          >
            <option value="">All Predictions</option>
            <option value="safe">Safe</option>
            <option value="phishing">Phishing</option>
          </select>

          <select
            id="filter-risk"
            className="filter-select"
            value={filterRisk}
            onChange={(e) => { setFilterRisk(e.target.value); setPage(0); }}
          >
            <option value="">All Risk Levels</option>
            <option value="safe">Safe</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {(filterRisk || filterPrediction) && (
            <button
              className="filter-clear"
              onClick={() => { setFilterRisk(''); setFilterPrediction(''); setPage(0); }}
            >
              Clear Filters
            </button>
          )}
        </motion.div>

        {/* Table */}
        <motion.div
          className="history-table-wrapper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          {loading ? (
            <div className="history-loading">
              <div className="loading-spinner" />
              <p>Loading scan history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="history-empty">
              <Clock size={48} />
              <h3>No Scan History</h3>
              <p>Scanned URLs will appear here. Head to the Scanner to get started.</p>
            </div>
          ) : (
            <table className="history-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>URL</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                  <th>Risk Level</th>
                  <th>Scanned At</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item, i) => {
                  const badge = getRiskBadge(item.risk_level)
                  const BadgeIcon = badge.icon
                  return (
                    <tr key={item.id}>
                      <td className="td-id">{page * ITEMS_PER_PAGE + i + 1}</td>
                      <td className="td-url">
                        <div className="url-cell">
                          <code>{item.url.length > 60 ? item.url.slice(0, 60) + '...' : item.url}</code>
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="url-link"
                            title="Open URL"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className={`prediction-badge ${item.prediction}`}>
                          {item.prediction === 'phishing' ? '🚨' : '✅'} {item.prediction}
                        </span>
                      </td>
                      <td>
                        <div className="confidence-cell">
                          <span className="confidence-val">{item.confidence}%</span>
                          <div className="confidence-mini-bar">
                            <div
                              className="confidence-mini-fill"
                              style={{
                                width: `${item.confidence}%`,
                                background: item.prediction === 'phishing'
                                  ? 'var(--danger)' : 'var(--success)',
                              }}
                            />
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          className="risk-badge"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          <BadgeIcon size={12} />
                          {item.risk_level}
                        </span>
                      </td>
                      <td className="td-date">
                        {new Date(item.scanned_at).toLocaleString()}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-btn"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft size={16} />
              Previous
            </button>
            <span className="page-info">
              Page {page + 1} of {totalPages}
            </span>
            <button
              className="page-btn"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              Next
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
