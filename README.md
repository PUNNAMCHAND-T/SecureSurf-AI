# SecureSurf AI — AI-Powered Phishing Website Detection System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![XGBoost](https://img.shields.io/badge/XGBoost-ML-F7931E?style=for-the-badge&logo=scikit-learn&logoColor=white)
![SHAP](https://img.shields.io/badge/SHAP-Explainable_AI-764ABC?style=for-the-badge)
![Chrome](https://img.shields.io/badge/Chrome-Extension_MV3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

A full-stack phishing detection platform that uses machine learning and explainable AI to classify URLs in real time — with a React dashboard, FastAPI backend, and Chrome browser extension.

</div>

---

## Overview

SecureSurf AI is an end-to-end system that detects phishing websites by extracting **36 URL-based features** and classifying them using trained ML models. Each prediction comes with a **SHAP-based explanation** showing exactly which features drove the decision.

**Key highlights:**
- 4 ML models trained and evaluated (Logistic Regression, Random Forest, XGBoost, SVM)
- Best model achieves **99.7% accuracy** and **99.7% F1 score** with 5-fold stratified cross-validation
- Explainable AI via SHAP TreeExplainer — per-prediction feature importance
- Real-time scanning through REST API, web dashboard, and Chrome extension
- Domain blacklist/whitelist, rate limiting, and input sanitization for security

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      SecureSurf AI Architecture                     │
├──────────────┬───────────────┬──────────────┬───────────────────────┤
│  Chrome      │   React.js    │   FastAPI    │   ML Pipeline         │
│  Extension   │   Dashboard   │   Backend    │                       │
│              │               │              │                       │
│  Manifest V3 │  Home         │  /predict    │  Feature Extraction   │
│  Auto-Scan   │  Scanner      │  /history    │  36 URL Features      │
│  Notifications│ History      │  /stats      │  4 ML Models          │
│  Warning     │  Analytics    │  /blacklist  │  SHAP Explainer       │
│  Banners     │  SHAP Charts  │  /whitelist  │  StandardScaler       │
└──────────────┴───────────────┴──────────────┴───────────────────────┘
```

**Data Flow:**
```
URL → Blacklist/Whitelist Check → Feature Extraction (36) → StandardScaler
  → ML Prediction → SHAP Explanation → JSON Response → Dashboard / Extension
  → SQLite (Scan History, Reports)
```

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **ML/AI** | Python, Scikit-Learn, XGBoost, SHAP, NumPy, Pandas |
| **Backend** | FastAPI, Uvicorn, SQLite, Pydantic v2, Joblib |
| **Frontend** | React 19, Vite, React Router, Recharts, Framer Motion |
| **Extension** | Chrome Manifest V3, Service Workers, Chrome Storage/Notifications APIs |

---

## Model Performance

All models were trained on 36 engineered URL features and evaluated with 5-fold stratified cross-validation.

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC | CV F1 Mean |
|-------|----------|-----------|--------|----------|---------|------------|
| **Logistic Regression** ⭐ | 99.7% | 99.6% | 99.8% | 99.7% | 99.99% | 99.81% |
| Random Forest | 99.7% | 99.6% | 99.8% | 99.7% | 100% | 99.80% |
| SVM | 99.7% | 99.6% | 99.8% | 99.7% | 100% | 99.76% |
| XGBoost | 99.65% | 99.6% | 99.7% | 99.65% | 100% | 99.73% |

> Best model is selected automatically based on F1 score.

---

## Feature Engineering (36 Features)

| Category | Features |
|----------|----------|
| **Length-based** | URL length, domain length, path length, query length |
| **Character counts** | Dots, hyphens, underscores, digits, special chars, `@` signs |
| **Ratios** | Digit-to-letter ratio, special character ratio |
| **Domain analysis** | IP address presence, HTTPS usage, subdomain count, www prefix |
| **Suspicious signals** | Keyword count, suspicious TLD, URL shortener detection |
| **Path analysis** | Path depth, double-slash redirect |
| **Entropy** | URL entropy, domain entropy (Shannon) |
| **Other** | Domain age indicator, non-standard port, fragment presence |

---

## Explainable AI (SHAP)

Every prediction includes a human-readable explanation powered by SHAP:

- **SHAP TreeExplainer** for tree-based models (Random Forest, XGBoost)
- **Per-prediction feature importance** — shows which features contributed most
- **Interactive bar chart** on the dashboard visualizing feature impact
- **Heuristic fallback** — domain-knowledge explanations when SHAP is unavailable (e.g., for Logistic Regression)

---

## API Endpoints

Base URL: `http://localhost:8000` &nbsp;|&nbsp; Interactive Docs: `/docs` (Swagger UI)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict` | Classify a URL as safe or phishing |
| `GET` | `/history` | Paginated scan history with filters |
| `POST` | `/report` | Report a URL as phishing or false positive |
| `GET` | `/stats` | Aggregated analytics and statistics |
| `GET` | `/model-info` | Trained model metadata and metrics |
| `GET/POST` | `/blacklist` | View or add blacklisted domains |
| `GET/POST` | `/whitelist` | View or add whitelisted domains |
| `GET` | `/health` | Health check |

**Example — `POST /predict`**

```json
// Request
{ "url": "http://suspicious-site.tk/login" }

// Response
{
  "prediction": "phishing",
  "is_phishing": true,
  "confidence": 94.5,
  "risk_level": "critical",
  "shap_explanation": {
    "method": "shap",
    "top_features": [
      { "feature": "has_suspicious_tld", "shap_value": 0.234, "impact": "increases_phishing" }
    ]
  }
}
```

---

## Frontend Dashboard

Built with React 19 + Vite, featuring 4 pages:

| Page | Description |
|------|-------------|
| **Home** | Landing page with feature highlights and architecture overview |
| **Scanner** | URL input with real-time classification, confidence meter, and SHAP bar chart |
| **History** | Paginated scan history table with risk-level and prediction filters |
| **Analytics** | KPI cards, pie/bar/line charts, radar chart, and model comparison table |

---

## Chrome Extension (Manifest V3)

- **Auto-scan** — scans every page visited automatically
- **Notifications** — browser alerts for medium, high, and critical risk URLs
- **Warning banners** — injects red/orange banners into dangerous pages
- **Local history** — last 100 scans stored in `chrome.storage.local`
- **Configurable** — toggle auto-scan, notifications, and set custom API URL
- **Reporting** — report URLs as phishing or false positive

---

## Security

| Feature | Implementation |
|---------|---------------|
| Domain Blacklist | Known phishing domains return instant `critical` results |
| Domain Whitelist | Trusted domains return instant `safe` results |
| Rate Limiting | 30 requests/minute per IP |
| Input Validation | Pydantic v2 validators for URL format and XSS prevention |
| XSS Prevention | Blocks `<script>`, `javascript:`, `data:` URL schemes |
| CORS | Configurable cross-origin resource sharing |

---

## Project Structure

```
SecureSurf-AI/
├── backend/
│   └── main.py                    # FastAPI application
├── frontend/src/
│   ├── components/                # Navbar
│   ├── pages/                     # Home, Scanner, History, Analytics
│   └── services/api.js            # API client
├── extension/
│   ├── manifest.json              # Chrome Manifest V3
│   ├── background.js              # Service worker (auto-scan)
│   ├── content.js                 # Warning banner injection
│   └── popup.html/js/css          # Extension popup UI
├── model/
│   ├── feature_engineering.py     # 36-feature extraction
│   ├── train_model.py             # Multi-model training pipeline
│   ├── shap_explainer.py          # SHAP explainability module
│   └── saved_models/              # Trained model artifacts
├── datasets/                      # Training data and feature matrix
├── proof/                         # Model performance plots and report
└── requirements.txt
```

---

## Getting Started

**Prerequisites:** Python 3.11+, Node.js 18+, Google Chrome

```bash
# Install dependencies
pip install -r requirements.txt

# Train the ML models
cd model && python train_model.py && cd ..

# Start the backend (http://localhost:8000)
cd backend && python main.py

# Start the frontend (http://localhost:5173)
cd frontend && npm install && npm run dev
```

To load the Chrome extension: open `chrome://extensions/`, enable Developer Mode, and load the `extension/` folder as an unpacked extension.

---

## License

MIT License
