"""
SHAP Explainability Module for SecureSurf AI
Generates SHAP explanations for model predictions.
"""

import os
import json
import logging
import numpy as np
import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

try:
    import shap
    HAS_SHAP = True
except ImportError:
    HAS_SHAP = False

from feature_engineering import extract_features, get_feature_names

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'saved_models')


class ShapExplainer:
    """
    SHAP-based explainability for phishing detection model.
    Provides feature importance and individual prediction explanations.
    """
    
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None
        self.explainer = None
        self._load_model()
    
    def _load_model(self):
        """Load the saved model, scaler, and feature names."""
        try:
            model_path = os.path.join(MODEL_DIR, 'best_model.joblib')
            scaler_path = os.path.join(MODEL_DIR, 'scaler.joblib')
            features_path = os.path.join(MODEL_DIR, 'feature_names.json')
            
            self.model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            
            with open(features_path, 'r') as f:
                self.feature_names = json.load(f)
            
            # Initialize SHAP explainer
            if HAS_SHAP:
                # Use KernelExplainer as a universal fallback
                # For tree-based models, use TreeExplainer when possible
                model_type = type(self.model).__name__
                if model_type in ['RandomForestClassifier', 'GradientBoostingClassifier', 'XGBClassifier']:
                    self.explainer = shap.TreeExplainer(self.model)
                else:
                    # For other models, we'll use KernelExplainer with background data
                    # We'll initialize it lazily to avoid issues
                    self.explainer = None
            
            logger.info("Model and explainer loaded successfully.")
            
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
    
    def predict(self, url: str) -> dict:
        """
        Make a prediction for a single URL with SHAP explanation.
        
        Args:
            url: The URL to analyze
            
        Returns:
            Dictionary with prediction, confidence, risk level, and SHAP explanation
        """
        # Extract features
        features = extract_features(url)
        feature_values = [features.get(name, 0) for name in self.feature_names]
        
        # Scale features
        X = np.array(feature_values).reshape(1, -1)
        X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
        X_scaled = self.scaler.transform(X)
        
        # Make prediction
        prediction = int(self.model.predict(X_scaled)[0])
        probabilities = self.model.predict_proba(X_scaled)[0]
        confidence = float(max(probabilities))
        phishing_probability = float(probabilities[1])
        
        # Determine risk level
        risk_level = self._get_risk_level(phishing_probability)
        
        # Get SHAP explanation
        shap_explanation = self._get_shap_explanation(X_scaled, features)
        
        result = {
            'url': url,
            'prediction': 'phishing' if prediction == 1 else 'safe',
            'is_phishing': prediction == 1,
            'confidence': round(confidence * 100, 2),
            'phishing_probability': round(phishing_probability * 100, 2),
            'safe_probability': round(probabilities[0] * 100, 2),
            'risk_level': risk_level,
            'features': features,
            'shap_explanation': shap_explanation,
        }
        
        return result
    
    def _get_risk_level(self, phishing_probability: float) -> str:
        """Determine risk level based on phishing probability."""
        if phishing_probability >= 0.8:
            return 'critical'
        elif phishing_probability >= 0.6:
            return 'high'
        elif phishing_probability >= 0.4:
            return 'medium'
        elif phishing_probability >= 0.2:
            return 'low'
        else:
            return 'safe'
    
    def _get_shap_explanation(self, X_scaled, features) -> dict:
        """Generate SHAP-based explanation for the prediction."""
        if not HAS_SHAP or self.explainer is None:
            # Fallback: use feature-based heuristic explanation
            return self._get_heuristic_explanation(features)
        
        try:
            shap_values = self.explainer.shap_values(X_scaled)
            
            # Handle different SHAP output formats
            if isinstance(shap_values, list):
                # For binary classification, use values for class 1 (phishing)
                sv = shap_values[1][0]
            else:
                sv = shap_values[0]
            
            # Create feature importance mapping
            feature_impacts = []
            for i, name in enumerate(self.feature_names):
                feature_impacts.append({
                    'feature': name,
                    'shap_value': round(float(sv[i]), 6),
                    'feature_value': float(features.get(name, 0)),
                    'impact': 'increases_phishing' if sv[i] > 0 else 'decreases_phishing',
                    'abs_impact': abs(float(sv[i])),
                })
            
            # Sort by absolute impact
            feature_impacts.sort(key=lambda x: x['abs_impact'], reverse=True)
            
            # Get top contributing features
            top_features = feature_impacts[:10]
            
            return {
                'method': 'shap',
                'top_features': top_features,
                'all_features': feature_impacts,
                'base_value': float(self.explainer.expected_value[1]) if isinstance(
                    self.explainer.expected_value, (list, np.ndarray)
                ) else float(self.explainer.expected_value),
            }
            
        except Exception as e:
            logger.warning(f"SHAP explanation failed: {e}. Using heuristic fallback.")
            return self._get_heuristic_explanation(features)
    
    def _get_heuristic_explanation(self, features: dict) -> dict:
        """
        Generate a heuristic-based explanation when SHAP is unavailable.
        Uses domain knowledge about phishing indicators.
        """
        indicators = []
        
        # Define feature-risk mappings
        risk_factors = {
            'has_ip_address': ('URL contains IP address', 0.9),
            'has_suspicious_keyword': ('Contains suspicious keywords', 0.7),
            'has_suspicious_tld': ('Uses suspicious TLD', 0.8),
            'is_shortened_url': ('URL is shortened', 0.6),
            'has_non_standard_port': ('Non-standard port detected', 0.7),
            'has_double_slash_redirect': ('Contains redirect pattern', 0.6),
            'domain_has_digits': ('Domain contains digits', 0.4),
        }
        
        safety_factors = {
            'has_https': ('Uses HTTPS encryption', -0.5),
            'has_www': ('Has www prefix', -0.2),
        }
        
        for feature, (desc, weight) in risk_factors.items():
            value = features.get(feature, 0)
            if value > 0:
                indicators.append({
                    'feature': feature,
                    'description': desc,
                    'shap_value': weight * value,
                    'feature_value': value,
                    'impact': 'increases_phishing',
                    'abs_impact': abs(weight * value),
                })
        
        for feature, (desc, weight) in safety_factors.items():
            value = features.get(feature, 0)
            if value > 0:
                indicators.append({
                    'feature': feature,
                    'description': desc,
                    'shap_value': weight,
                    'feature_value': value,
                    'impact': 'decreases_phishing',
                    'abs_impact': abs(weight),
                })
        
        # Numeric risk factors
        url_length = features.get('url_length', 0)
        if url_length > 75:
            indicators.append({
                'feature': 'url_length',
                'description': f'Unusually long URL ({url_length} chars)',
                'shap_value': min((url_length - 75) / 100, 0.8),
                'feature_value': url_length,
                'impact': 'increases_phishing',
                'abs_impact': min((url_length - 75) / 100, 0.8),
            })
        
        num_subdomains = features.get('num_subdomains', 0)
        if num_subdomains > 2:
            indicators.append({
                'feature': 'num_subdomains',
                'description': f'Excessive subdomains ({num_subdomains})',
                'shap_value': 0.5 * num_subdomains,
                'feature_value': num_subdomains,
                'impact': 'increases_phishing',
                'abs_impact': 0.5 * num_subdomains,
            })
        
        indicators.sort(key=lambda x: x['abs_impact'], reverse=True)
        
        return {
            'method': 'heuristic',
            'top_features': indicators[:10],
            'all_features': indicators,
            'base_value': 0.5,
        }
    
    def generate_shap_plot(self, url: str, save_path: str = None) -> str:
        """Generate a SHAP waterfall plot for a single prediction."""
        if not HAS_SHAP or self.explainer is None:
            logger.warning("SHAP not available for plotting.")
            return None
        
        features = extract_features(url)
        feature_values = [features.get(name, 0) for name in self.feature_names]
        
        X = np.array(feature_values).reshape(1, -1)
        X = np.nan_to_num(X, nan=0.0, posinf=0.0, neginf=0.0)
        X_scaled = self.scaler.transform(X)
        
        try:
            shap_values = self.explainer.shap_values(X_scaled)
            
            if save_path is None:
                save_path = os.path.join(
                    os.path.dirname(BASE_DIR), 'docs', 'plots', 'shap_explanation.png'
                )
            
            fig, ax = plt.subplots(figsize=(12, 8))
            
            if isinstance(shap_values, list):
                sv = shap_values[1][0]
            else:
                sv = shap_values[0]
            
            # Top 15 features by absolute SHAP value
            indices = np.argsort(np.abs(sv))[::-1][:15]
            
            colors = ['#e74c3c' if sv[i] > 0 else '#2ecc71' for i in indices]
            
            ax.barh(range(len(indices)), [sv[i] for i in indices][::-1],
                    color=colors[::-1], edgecolor='white', linewidth=0.5)
            ax.set_yticks(range(len(indices)))
            ax.set_yticklabels([self.feature_names[i] for i in indices][::-1], fontsize=10)
            ax.set_xlabel('SHAP Value (Impact on Phishing Prediction)', fontsize=12)
            ax.set_title(f'SHAP Explanation for URL', fontsize=14, fontweight='bold')
            ax.axvline(x=0, color='black', linewidth=0.5)
            ax.grid(axis='x', alpha=0.3)
            
            plt.tight_layout()
            plt.savefig(save_path, dpi=150, bbox_inches='tight')
            plt.close()
            
            return save_path
            
        except Exception as e:
            logger.error(f"Error generating SHAP plot: {e}")
            return None


# Singleton instance
_explainer = None


def get_explainer() -> ShapExplainer:
    """Get or create the singleton ShapExplainer instance."""
    global _explainer
    if _explainer is None:
        _explainer = ShapExplainer()
    return _explainer
