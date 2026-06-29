# 🛡️ SecureSurf AI — AI-Powered Phishing Website Detection System

<div align="center">

![SecureSurf AI](https://img.shields.io/badge/SecureSurf-AI-667eea?style=for-the-badge&logo=shield&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![Chrome](https://img.shields.io/badge/Chrome-Extension-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

**A full-stack AI-powered phishing website detection system with explainable AI,
real-time URL scanning, browser extension, and analytics dashboard.**

[🚀 Live Demo](#deployment) · [📖 Documentation](#documentation) · [🧪 API Docs](#api-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Machine Learning Pipeline](#machine-learning-pipeline)
- [API Documentation](#api-documentation)
- [Frontend Dashboard](#frontend-dashboard)
- [Chrome Extension](#chrome-extension)
- [Security Features](#security-features)
- [Deployment](#deployment)
- [Future Enhancements](#future-enhancements)
- [License](#license)

---

## 🔍 Overview

SecureSurf AI is a comprehensive phishing website detection platform that combines:

- **Machine Learning** (4 models: Logistic Regression, Random Forest, XGBoost, SVM)
- **Explainable AI** (SHAP-based feature importance explanations + interactive bar charts)
- **REST API** (FastAPI with rate limiting, blacklisting, whitelisting, and input validation)
- **Web Dashboard** (React.js with real-time analytics, charts, and SHAP visualizations)
- **Browser Extension** (Chrome Manifest V3 with auto-scan, notifications, and warning banners)

The system extracts **30+ URL-based features** and uses trained ML models to classify URLs as **Safe** or **Phishing** with confidence scores and human-readable explanations.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SecureSurf AI Architecture                      │
├──────────────┬───────────────┬──────────────┬───────────────────────┤
│              │               │              │                       │
│  Chrome      │   React.js    │   FastAPI    │   ML Pipeline         │
│  Extension   │   Dashboard   │   Backend    │                       │
│              │               │              │                       │
│  ┌────────┐  │  ┌─────────┐  │  ┌────────┐  │  ┌────────────────┐  │
│  │Manifest│  │  │  Home   │  │  │/predict│  │  │Feature Extract.│  │
│  │  V3    │  │  │ Scanner │  │  │/history│  │  │  30+ Features  │  │
│  │        │  │  │ History │  │  │/report │  │  │                │  │
│  │Auto    │  │  │Analytics│  │  │/stats  │  │  │  4 ML Models   │  │
│  │Scan    │──│──│         │──│──│/black  │──│──│  LR/RF/XGB/SVM │  │
│  │        │  │  │Recharts │  │  │/white  │  │  │                │  │
│  │Notify  │  │  │SHAP Bar │  │  │SQLite  │  │  │ SHAP Explainer │  │
│  │Banners │  │  │Charts   │  │  │Rate    │  │  │  TreeExplainer │  │
│  └────────┘  │  └─────────┘  │  Limit   │  │  └────────────────┘  │
│              │               └──────────┘  │                       │
└──────────────┴───────────────┴──────────────┴───────────────────────┘
```

### Data Flow

```
URL Input → Blacklist/Whitelist Check → Feature Extraction (30+) → StandardScaler
    ↓                                                                      ↓
SHAP Explanation ← Feature Importance ← ML Model Prediction (Safe/Phishing)
    ↓                                                                      ↓
API Response (JSON) → Frontend (SHAP bar chart) / Extension Popup / Notification
    ↓
SQLite Database (Scan History, Reports, Blacklist/Whitelist)
```

---

## ✨ Features

### 🤖 Machine Learning
| Feature | Description |
|---------|-------------|
| 4 ML Models | Logistic Regression, Random Forest, XGBoost, SVM |
| 30+ URL Features | Length, entropy, subdomains, suspicious keywords, TLDs, IP detection |
| Auto Model Selection | Selects best model based on F1 score |
| Cross Validation | 5-fold stratified cross-validation |
| Realistic Training Data | Includes edge-case URLs for realistic ~92-97% accuracy metrics |

### 🧠 Explainable AI
| Feature | Description |
|---------|-------------|
| SHAP Integration | TreeExplainer for tree-based models |
| Feature Importance | Top features driving each prediction |
| SHAP Bar Chart | Interactive horizontal bar chart showing each feature's impact |
| Heuristic Fallback | Domain-knowledge explanations when SHAP unavailable |

### 🔐 Security
| Feature | Description |
|---------|-------------|
| Domain Blacklist | Known phishing domains blocked instantly (GET/POST /blacklist) |
| Domain Whitelist | Trusted domains fast-tracked (GET/POST /whitelist) |
| Rate Limiting | 30 requests/minute per IP |
| Input Sanitization | XSS prevention, URL validation (Pydantic v2) |

### 📊 Analytics
| Feature | Description |
|---------|-------------|
| Scan Statistics | Total scans, safe/phishing breakdown |
| Risk Distribution | Safe/Low/Medium/High/Critical breakdown |
| Daily Trends | 7-day scan activity line chart |
| Model Comparison | Side-by-side model performance metrics |
| Radar Chart | Best model performance across all metrics |

---

## 🛠️ Tech Stack

| Layer | Technologies |
|-------|-------------|
| **ML/AI** | Python 3.11+, Scikit-Learn, XGBoost, SHAP, NumPy, Pandas |
| **Backend** | FastAPI, Uvicorn, SQLite, Pydantic v2, Joblib |
| **Frontend** | React 19, Vite, React Router, Recharts, Framer Motion, Lucide Icons |
| **Extension** | Chrome Manifest V3, Service Workers, Chrome Storage/Notifications APIs |
| **Deployment** | Render (Backend), Vercel (Frontend), Chrome Web Store (Extension) |

---

## 📁 Project Structure

```
SecureSurf-AI/
├── backend/
│   └── main.py                    # FastAPI app (predict, history, report, stats, blacklist, whitelist)
├── frontend/
│   ├── .env.local                 # VITE_API_URL config
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx         # Responsive navigation
│       │   └── Navbar.css
│       ├── pages/
│       │   ├── Home.jsx           # Landing page
│       │   ├── Scanner.jsx        # URL scanner + SHAP bar chart
│       │   ├── History.jsx        # Paginated scan history table
│       │   └── Analytics.jsx      # KPI cards + charts + model metrics
│       └── services/
│           └── api.js             # API client
├── extension/
│   ├── manifest.json              # Chrome Manifest V3
│   ├── background.js              # Service worker (auto-scan + notifications)
│   ├── content.js                 # Page warning banners
│   ├── popup.html / popup.js / popup.css
│   └── icons/
│       ├── icon16.png             # Generated PNG icons
│       ├── icon32.png
│       ├── icon48.png
│       └── icon128.png
├── model/
│   ├── feature_engineering.py     # 30+ URL feature extraction
│   ├── train_model.py             # 4-model training pipeline
│   ├── shap_explainer.py          # SHAP explainability module
│   └── saved_models/              # best_model.joblib, scaler.joblib, metadata
├── datasets/
│   ├── phishing_urls.csv          # Training dataset
│   └── feature_matrix.csv         # Extracted features
├── docs/plots/                    # Generated visualizations
├── generate_icons.py              # Extension icon generator (stdlib only)
├── setup.bat                      # First-time setup script
├── start_backend.bat              # Launch FastAPI backend
├── start_frontend.bat             # Launch React dev server
├── requirements.txt               # Python dependencies
├── render.yaml                    # Render deployment config
├── vercel.json                    # Vercel deployment config
└── README.md
```

---

## 🚀 Setup Instructions

### Prerequisites

- **Python 3.11+** with pip
- **Node.js 18+** with npm
- **Google Chrome** (for extension)

### Quick Start (Windows)

```bash
# 1. Run the setup script (installs dependencies + generates icons)
setup.bat

# 2. Train the ML model
cd model && python train_model.py && cd ..

# 3. Start the backend (in one terminal)
start_backend.bat

# 4. Start the frontend (in another terminal)
start_frontend.bat
```

### Manual Setup

```bash
# Install Python dependencies
pip install -r requirements.txt

# Generate extension icons
python generate_icons.py

# Train the ML model
cd model
python train_model.py
cd ..

# Start FastAPI backend
cd backend
python main.py
# → API running at http://localhost:8000
# → API Docs at http://localhost:8000/docs

# Install and start frontend
cd frontend
npm install
npm run dev
# → Dashboard at http://localhost:5173
```

### Load the Chrome Extension

1. Open Chrome → `chrome://extensions/`
2. Enable **Developer Mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `extension/` directory
5. Pin **SecureSurf AI** to your toolbar

> The extension connects to `http://localhost:8000` by default. You can change this in the extension Settings tab.

---

## 🤖 Machine Learning Pipeline

### Feature Engineering (30+ Features)

| Category | Features |
|----------|----------|
| **Length** | URL length, domain length, path length, query length |
| **Character** | Dots, hyphens, underscores, digits, special chars, @ signs |
| **Ratios** | Digit-letter ratio, special char ratio |
| **Domain** | IP address presence, HTTPS usage, subdomain count, www prefix |
| **Suspicious** | Keyword count, suspicious TLD, URL shortener detection |
| **Path** | Path depth, double-slash redirect |
| **Entropy** | URL entropy, domain entropy (Shannon) |
| **Other** | Domain age, non-standard port, fragment presence |

### Models Trained

| Model | Description |
|-------|-------------|
| **Logistic Regression** | Linear classifier with L2 regularization, balanced class weights |
| **Random Forest** | Ensemble of 200 decision trees, balanced class weights |
| **XGBoost** | Gradient boosting with 200 estimators, log-loss evaluation |
| **SVM** | RBF kernel with probability calibration, balanced class weights |

### Evaluation Metrics

Each model is evaluated using:
- **Accuracy** — Overall correctness
- **Precision** — Phishing prediction accuracy  
- **Recall** — Phishing detection rate
- **F1 Score** — Harmonic mean of precision and recall
- **ROC-AUC** — Area under ROC curve
- **5-Fold CV** — Cross-validated F1 score

---

## 📡 API Documentation

### Base URL: `http://localhost:8000`
### Interactive Docs: `http://localhost:8000/docs`

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Scan a URL for phishing |
| `GET` | `/history` | Get scan history (filterable, paginated) |
| `POST` | `/report` | Report a URL as phishing/false positive |
| `GET` | `/stats` | Get aggregated analytics statistics |
| `GET` | `/model-info` | Get trained model metadata & metrics |
| `GET` | `/blacklist` | List all blacklisted domains |
| `POST` | `/blacklist` | Add a domain to the blacklist |
| `GET` | `/whitelist` | List all trusted/whitelisted domains |
| `POST` | `/whitelist` | Add a domain to the whitelist |
| `GET` | `/health` | API health check |

#### `POST /predict` — Example

**Request:**
```json
{ "url": "http://suspicious-site.tk/login" }
```

**Response:**
```json
{
  "url": "http://suspicious-site.tk/login",
  "prediction": "phishing",
  "is_phishing": true,
  "confidence": 94.5,
  "phishing_probability": 94.5,
  "safe_probability": 5.5,
  "risk_level": "critical",
  "shap_explanation": {
    "method": "shap",
    "top_features": [
      { "feature": "has_suspicious_tld", "shap_value": 0.234, "impact": "increases_phishing", "abs_impact": 0.234 }
    ]
  },
  "scan_id": 42,
  "source": "model"
}
```

---

## 🖥️ Frontend Dashboard

| Page | URL | Description |
|------|-----|-------------|
| **Home** | `/` | Landing page with features, architecture flow, and statistics |
| **URL Scanner** | `/scanner` | URL input, real-time scanning, SHAP bar chart, confidence breakdown |
| **Scan History** | `/history` | Paginated table with risk-level and prediction filters |
| **Analytics** | `/analytics` | KPI cards, pie/bar/line charts, radar chart, model comparison table |

---

## 🔌 Chrome Extension

### Features
- 🔍 **Auto-scan** — Automatically scans every page you visit
- 🔔 **Notifications** — Browser alerts for medium/high/critical risk URLs
- ⚠️ **Warning Banners** — Red/orange banners injected into dangerous pages
- 📋 **Local History** — Last 100 scans stored in `chrome.storage.local`
- ⚙️ **Settings** — Configurable auto-scan, notifications, custom API URL
- 🚩 **Reporting** — Report URLs as phishing or false positive

### Risk Display
| Status | Meaning |
|--------|---------| 
| ✅ Safe | Website is legitimate |
| ⚠️ Suspicious | Moderate risk, proceed with caution |
| 🚨 Phishing | High-confidence phishing detection |

---

## 🔐 Security Features

1. **Domain Blacklist** — Known phishing domains return instant `critical` results
2. **Domain Whitelist** — Trusted domains (Google, GitHub, etc.) return instant `safe` results
3. **Rate Limiting** — 30 requests per minute per IP address
4. **Pydantic v2 Validation** — `@field_validator` for URL format and XSS prevention
5. **XSS Prevention** — Blocks `<script>`, `javascript:`, `data:` URL schemes
6. **CORS** — Configurable Cross-Origin Resource Sharing
7. **Input Sanitization** — URL length limits and format validation

---

## 🌐 Deployment

### Backend → Render

1. Push code to GitHub
2. Connect repo to [Render](https://render.com)
3. Render will use `render.yaml` configuration automatically
4. Set environment variable: `PYTHON_VERSION=3.11.6`

### Frontend → Vercel

1. Push code to GitHub
2. Connect repo to [Vercel](https://vercel.com)
3. Set **Build Command**: `cd frontend && npm run build`
4. Set **Output Directory**: `frontend/dist`
5. Add environment variable: `VITE_API_URL=https://your-api.onrender.com`

### Chrome Extension → Chrome Web Store

1. Icons are already in PNG format in `extension/icons/`
2. Update `manifest.json` host_permissions with your production API URL
3. Create ZIP: `Compress-Archive -Path extension -DestinationPath SecureSurf-extension.zip`
4. Upload to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)

---

## 🔮 Future Enhancements

- [ ] Deep learning model (LSTM/Transformer for URL sequence analysis)
- [ ] Real-time domain WHOIS lookup integration
- [ ] Screenshot-based visual similarity detection
- [ ] Email phishing detection (beyond URLs)
- [ ] User authentication and personalized dashboards
- [ ] Browser extension for Firefox and Edge
- [ ] Automated retraining pipeline with new reported URLs
- [ ] Integration with VirusTotal and Google Safe Browsing API

---

## 👨‍💻 Author

**B.Tech Final Year Project**

Built as part of the Final Year B.Tech Computer Science project, demonstrating:
- Machine Learning & Explainable AI (XAI)
- Full-Stack Web Development (React + FastAPI)
- Browser Extension Development (Chrome MV3)
- Cybersecurity & Threat Detection

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">
  <p>Built with ❤️ using Python, React, FastAPI & SHAP</p>
  <p><strong>SecureSurf AI</strong> — Detect. Explain. Protect.</p>
</div>
