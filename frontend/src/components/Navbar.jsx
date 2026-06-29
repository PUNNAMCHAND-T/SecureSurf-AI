import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Search, Clock, BarChart3, Menu, X } from 'lucide-react'
import './Navbar.css'

const navLinks = [
  { path: '/', label: 'Home', icon: Shield },
  { path: '/scanner', label: 'URL Scanner', icon: Search },
  { path: '/history', label: 'Scan History', icon: Clock },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
]

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location])

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <div className="nav-logo-icon">🛡️</div>
          <div className="nav-logo-text">
            <span className="nav-brand">SecureSurf</span>
            <span className="nav-brand-ai">AI</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className={`nav-links ${mobileOpen ? 'open' : ''}`}>
          {navLinks.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${location.pathname === path ? 'active' : ''}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </div>

        {/* API Status Indicator */}
        <div className="nav-status">
          <div className="status-indicator" title="API Status">
            <span className="status-dot pulse"></span>
            <span className="status-label">Live</span>
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  )
}
