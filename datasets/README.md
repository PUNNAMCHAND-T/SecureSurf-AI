# 📦 Datasets Directory — SecureSurf AI

This directory stores the training datasets and extracted feature matrices
used by the ML training pipeline.

---

## 🔄 How It Works

When you run `python train_model.py`, the pipeline:

1. **Looks for** `phishing_urls.csv` in this directory
2. **If found** — uses your real dataset (recommended for best accuracy)
3. **If not found** — auto-generates a synthetic dataset of 10,000+ URLs with
   realistic phishing and legitimate URL patterns, including edge-case noise
   for more credible model metrics

---

## 📁 Generated Files

After training, this directory will contain:

| File | Description |
|------|-------------|
| `phishing_urls.csv` | Raw URL dataset (`url`, `label` columns) |
| `feature_matrix.csv` | Extracted feature matrix (30+ features per URL) |

---

## 🌐 Using a Real Dataset (Recommended)

Using a real-world dataset dramatically improves model generalizability.

### Option 1 — Kaggle Phishing Dataset (Recommended)

```bash
# Download from Kaggle
https://www.kaggle.com/datasets/shashwatwork/phishing-dataset-for-machine-learning

# Rename / place the CSV here as:
datasets/phishing_urls.csv

# Ensure columns: url (string), label (int: 0=safe, 1=phishing)
```

### Option 2 — PhishTank Feed

```bash
# Download from PhishTank (requires free API key)
https://phishtank.org/developer_info.php

# Convert format:
python -c "
import pandas as pd
df = pd.read_csv('verified_online.csv')
df = df[['url']].copy()
df['label'] = 1          # All PhishTank entries are phishing
df.to_csv('phishing_urls.csv', index=False)
"
# Then add legitimate URLs from a source like Alexa/Tranco top-1M list
```

### Option 3 — UCI Phishing Websites Dataset

```bash
https://archive.ics.uci.edu/ml/datasets/phishing+websites
```

---

## 📋 Required CSV Format

```csv
url,label
https://www.google.com,0
https://www.github.com,0
http://suspicious-login.tk/verify,1
http://paypal.account-update.xyz/secure,1
```

| Column | Type | Values |
|--------|------|--------|
| `url` | string | Full URL including scheme |
| `label` | integer | `0` = Safe / Legitimate, `1` = Phishing |

> **Tip:** Aim for a balanced dataset (roughly 50/50 safe vs phishing) for best results.

---

## 🤖 Synthetic Dataset (Auto-Generated)

If no CSV is provided, the pipeline generates synthetic data covering:

**Legitimate URL patterns:**
- Major domain names (google.com, github.com, amazon.com, etc.)
- Realistic paths (`/search`, `/login`, `/api/v1/data`, etc.)
- Mix of HTTP/HTTPS

**Phishing URL patterns:**
- IP-based URLs (`http://192.168.x.x/phishing/login.php`)
- Suspicious TLDs (`.tk`, `.ml`, `.ga`, `.cf`, `.xyz`, `.top`)
- Brand impersonation keywords (`paypal-verify`, `secure-amazon`)
- Typosquatting patterns
- Long random subdomains
- Double-slash redirects

**Realistic noise samples:**
- Edge-case legitimate URLs with suspicious-looking paths
- Phishing URLs with minimal indicators (harder to detect)

---

## 📊 Feature Engineering

The feature extractor (`model/feature_engineering.py`) produces **30+ features**:

| Category | Features |
|----------|----------|
| Length | URL length, domain length, path length, query length |
| Characters | Dot count, hyphens, underscores, digits, @-signs |
| Ratios | Digit/letter ratio, special char ratio |
| Domain | IP presence, HTTPS, subdomain count, www prefix |
| Suspicious | Keyword count, suspicious TLD, URL shortener |
| Path | Depth, double-slash redirect |
| Entropy | URL Shannon entropy, domain entropy |
| Other | Non-standard port, fragment, domain age |
