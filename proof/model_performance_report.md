# SecureSurf AI — Model Performance Report

## Project: ML-Powered Phishing Website Detection System
**Type:** Self-Initiated Personal Project  
**Domain:** Artificial Intelligence & Machine Learning | Cybersecurity  
**Tech Stack:** Python, Scikit-Learn, XGBoost, SHAP, FastAPI, React.js, Chrome Extension (MV3)

---

## ML Model Results (Trained on 30+ URL Features)

| Model | Accuracy | Precision | Recall | F1 Score | ROC-AUC | CV F1 Mean |
|-------|----------|-----------|--------|----------|---------|------------|
| **Logistic Regression** ⭐ Best | 99.7% | 99.6% | 99.8% | 99.7% | 99.99% | 99.81% |
| Random Forest | 99.7% | 99.6% | 99.8% | 99.7% | 100% | 99.80% |
| SVM | 99.7% | 99.6% | 99.8% | 99.7% | 100% | 99.76% |
| XGBoost | 99.65% | 99.6% | 99.7% | 99.65% | 100% | 99.73% |

> ⭐ Best model selected automatically based on F1 Score.  
> Validation: 5-Fold Stratified Cross-Validation on all models.

---

## Feature Engineering

- **Total Features Extracted:** 36 URL-based features
- Categories: URL length, entropy (Shannon), subdomain count, special character ratios, suspicious TLDs, digit-letter ratios, HTTPS usage, IP address presence, URL shortener detection, path depth, and more.

---

## Explainable AI (SHAP)

- **Method:** SHAP TreeExplainer
- **Output:** Per-prediction feature importance scores
- **Visualization:** Interactive horizontal bar chart in React dashboard

---

## Proof Files in This Folder

| File | Description |
|------|-------------|
| `confusion_matrices.png` | Confusion matrix for all 4 models |
| `roc_curves.png` | ROC-AUC curves for all 4 models |
| `feature_importance.png` | Top URL features driving phishing detection |
| `model_comparison.png` | Side-by-side comparison of all model metrics |
| `model_performance_report.md` | This report |
