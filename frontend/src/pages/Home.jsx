import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Search, Brain, Globe2, BarChart3, Lock, Zap, Globe } from 'lucide-react'
import './Home.css'

const features = [
  {
    icon: Brain,
    title: 'Multi-Model AI Detection',
    desc: 'Uses Logistic Regression, Random Forest, XGBoost & SVM to detect phishing URLs with high accuracy.',
    color: '#667eea',
  },
  {
    icon: Search,
    title: 'Real-Time URL Scanning',
    desc: 'Instantly analyze any URL and get a detailed risk assessment with confidence scoring.',
    color: '#22c55e',
  },
  {
    icon: BarChart3,
    title: 'SHAP Explainability',
    desc: 'Understand exactly why a URL is classified as phishing or safe with feature-level explanations.',
    color: '#f59e0b',
  },
  {
    icon: Globe2,
    title: 'Chrome Extension',
    desc: 'Automatic real-time protection with a browser extension that scans every page you visit.',
    color: '#3b82f6',
  },
  {
    icon: Lock,
    title: 'Security Features',
    desc: 'Domain blacklisting & whitelisting, rate limiting, input sanitization, and XSS prevention.',
    color: '#ef4444',
  },
  {
    icon: Globe,
    title: '30+ URL Features',
    desc: 'Analyzes URL length, entropy, subdomains, suspicious keywords, TLDs, IP addresses & more.',
    color: '#8b5cf6',
  },
]

const stats = [
  { value: '97%+', label: 'Detection Accuracy' },
  { value: '30+', label: 'URL Features' },
  { value: '4', label: 'ML Models' },
  { value: '<1s', label: 'Scan Time' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' },
  }),
}

export default function Home() {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-orb hero-bg-orb-1" />
        <div className="hero-bg-orb hero-bg-orb-2" />
        <div className="hero-bg-orb hero-bg-orb-3" />

        <div className="container hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Zap size={14} />
            <span>AI-Powered Cybersecurity</span>
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Detect Phishing Websites
            <br />
            <span className="hero-title-gradient">Before They Catch You</span>
          </motion.h1>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
          >
            SecureSurf AI uses advanced machine learning models with SHAP explainability 
            to instantly detect and explain phishing threats. Protect yourself with 
            real-time URL scanning and browser-level security.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link to="/scanner" className="btn btn-primary btn-lg">
              <Search size={18} />
              Scan a URL Now
            </Link>
            <Link to="/analytics" className="btn btn-outline btn-lg">
              <BarChart3 size={18} />
              View Analytics
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="hero-stats"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="hero-stat">
                <div className="hero-stat-value">{stat.value}</div>
                <div className="hero-stat-label">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">How It Works</h2>
            <p className="section-desc">
              Powered by multiple ML models and explainable AI, SecureSurf AI provides 
              comprehensive phishing detection with full transparency.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feat, i) => (
              <motion.div
                key={feat.title}
                className="feature-card"
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
              >
                <div
                  className="feature-icon"
                  style={{ background: `${feat.color}15`, color: feat.color }}
                >
                  <feat.icon size={24} />
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="arch-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">System Architecture</h2>
            <p className="section-desc">
              End-to-end pipeline from URL input to explainable prediction.
            </p>
          </div>

          <div className="arch-flow">
            {[
              { icon: '🌐', label: 'URL Input', sub: 'User/Extension' },
              { icon: '⚙️', label: 'Feature Extraction', sub: '30+ Features' },
              { icon: '🧠', label: 'ML Prediction', sub: '4 Models' },
              { icon: '📊', label: 'SHAP Explanation', sub: 'Explainable AI' },
              { icon: '✅', label: 'Result', sub: 'Safe / Phishing' },
            ].map((step, i) => (
              <motion.div
                key={step.label}
                className="arch-step"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
              >
                <div className="arch-step-icon">{step.icon}</div>
                <div className="arch-step-label">{step.label}</div>
                <div className="arch-step-sub">{step.sub}</div>
                {i < 4 && <div className="arch-arrow">→</div>}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="cta-icon" size={48} />
            <h2 className="cta-title">Start Protecting Yourself Today</h2>
            <p className="cta-desc">
              Try SecureSurf AI now — scan any URL for free and see the AI in action.
            </p>
            <Link to="/scanner" className="btn btn-primary btn-lg">
              <Search size={18} />
              Open URL Scanner
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
