import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Scanner from './pages/Scanner'
import History from './pages/History'
import Analytics from './pages/Analytics'
import './App.css'

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/history" element={<History />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
      <footer className="footer">
        <div className="container">
          <p>© 2026 SecureSurf AI — AI-Powered Phishing Detection System</p>
          <p className="footer-sub">Built with FastAPI, Scikit-Learn, SHAP & React</p>
        </div>
      </footer>
    </div>
  )
}

export default App
