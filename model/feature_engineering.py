"""
Feature Engineering Module for SecureSurf AI
Extracts URL-based features for phishing detection.
"""

import re
import math
import socket
import urllib.parse
from datetime import datetime
import whois
import logging

logger = logging.getLogger(__name__)

# Suspicious keywords commonly found in phishing URLs
SUSPICIOUS_KEYWORDS = [
    'login', 'signin', 'verify', 'account', 'update', 'secure',
    'banking', 'confirm', 'password', 'credential', 'suspend',
    'unusual', 'alert', 'urgent', 'expire', 'validate', 'wallet',
    'paypal', 'apple', 'microsoft', 'google', 'facebook', 'amazon',
    'netflix', 'ebay', 'instagram', 'whatsapp', 'telegram',
    'free', 'winner', 'prize', 'reward', 'gift', 'offer',
    'click', 'here', 'now', 'immediately', 'action', 'required',
    'support', 'help', 'service', 'customer', 'client',
]

# Known phishing TLDs
SUSPICIOUS_TLDS = [
    '.tk', '.ml', '.ga', '.cf', '.gq', '.xyz', '.top', '.club',
    '.online', '.site', '.info', '.buzz', '.icu', '.work',
]


def extract_features(url: str) -> dict:
    """
    Extract all features from a given URL for phishing detection.
    
    Args:
        url: The URL string to analyze
        
    Returns:
        Dictionary containing all extracted features
    """
    features = {}
    
    # Ensure URL has a scheme
    if not url.startswith(('http://', 'https://')):
        url = 'http://' + url
    
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception as e:
        logger.error(f"Error parsing URL: {e}")
        return _get_default_features()
    
    domain = parsed.netloc
    path = parsed.path
    
    # ---- Basic URL Features ----
    features['url_length'] = len(url)
    features['domain_length'] = len(domain)
    features['path_length'] = len(path)
    
    # ---- Character-based Features ----
    features['num_dots'] = url.count('.')
    features['num_hyphens'] = url.count('-')
    features['num_underscores'] = url.count('_')
    features['num_slashes'] = url.count('/')
    features['num_question_marks'] = url.count('?')
    features['num_equals'] = url.count('=')
    features['num_at_signs'] = url.count('@')
    features['num_ampersands'] = url.count('&')
    features['num_exclamations'] = url.count('!')
    features['num_tildes'] = url.count('~')
    features['num_digits'] = sum(c.isdigit() for c in url)
    features['num_letters'] = sum(c.isalpha() for c in url)
    features['num_special_chars'] = len(re.findall(r'[^a-zA-Z0-9]', url))
    
    # ---- Ratio Features ----
    total_chars = len(url) if len(url) > 0 else 1
    features['digit_letter_ratio'] = features['num_digits'] / max(features['num_letters'], 1)
    features['special_char_ratio'] = features['num_special_chars'] / total_chars
    
    # ---- Domain-based Features ----
    features['has_ip_address'] = _has_ip_address(domain)
    features['has_https'] = 1 if parsed.scheme == 'https' else 0
    features['num_subdomains'] = _count_subdomains(domain)
    features['has_www'] = 1 if domain.startswith('www.') else 0
    features['domain_has_digits'] = 1 if any(c.isdigit() for c in domain.split('.')[0]) else 0
    
    # ---- Suspicious keyword Features ----
    features['num_suspicious_keywords'] = _count_suspicious_keywords(url.lower())
    features['has_suspicious_keyword'] = 1 if features['num_suspicious_keywords'] > 0 else 0
    
    # ---- TLD Features ----
    features['has_suspicious_tld'] = _has_suspicious_tld(domain)
    
    # ---- Path Features ----
    features['path_depth'] = path.count('/') - 1 if path else 0
    features['has_double_slash_redirect'] = 1 if '//' in path else 0
    
    # ---- Query Features ----
    query = parsed.query
    features['query_length'] = len(query)
    features['num_query_params'] = len(urllib.parse.parse_qs(query))
    
    # ---- Entropy Features ----
    features['url_entropy'] = _calculate_entropy(url)
    features['domain_entropy'] = _calculate_entropy(domain)
    
    # ---- Domain Age (optional, may fail) ----
    features['domain_age_days'] = _get_domain_age(domain)
    
    # ---- Port Features ----
    features['has_non_standard_port'] = _has_non_standard_port(parsed)
    
    # ---- URL Shortener Detection ----
    features['is_shortened_url'] = _is_shortened_url(domain)
    
    # ---- Fragment Features ----
    features['has_fragment'] = 1 if parsed.fragment else 0
    
    return features


def _has_ip_address(domain: str) -> int:
    """Check if the domain contains an IP address."""
    # IPv4 pattern
    ipv4_pattern = r'\b(?:\d{1,3}\.){3}\d{1,3}\b'
    # Hex-encoded IP
    hex_pattern = r'0x[0-9a-fA-F]+'
    
    if re.search(ipv4_pattern, domain):
        return 1
    if re.search(hex_pattern, domain):
        return 1
    
    try:
        socket.inet_aton(domain)
        return 1
    except socket.error:
        return 0


def _count_subdomains(domain: str) -> int:
    """Count the number of subdomains in the domain."""
    # Remove 'www.' prefix if present
    if domain.startswith('www.'):
        domain = domain[4:]
    
    parts = domain.split('.')
    # Subtract 2 for the main domain and TLD
    return max(0, len(parts) - 2)


def _count_suspicious_keywords(url: str) -> int:
    """Count the number of suspicious keywords in the URL."""
    count = 0
    for keyword in SUSPICIOUS_KEYWORDS:
        if keyword in url:
            count += 1
    return count


def _has_suspicious_tld(domain: str) -> int:
    """Check if the domain has a suspicious TLD."""
    for tld in SUSPICIOUS_TLDS:
        if domain.endswith(tld):
            return 1
    return 0


def _calculate_entropy(text: str) -> float:
    """Calculate Shannon entropy of a string."""
    if not text:
        return 0.0
    
    freq = {}
    for char in text:
        freq[char] = freq.get(char, 0) + 1
    
    entropy = 0.0
    length = len(text)
    for count in freq.values():
        probability = count / length
        if probability > 0:
            entropy -= probability * math.log2(probability)
    
    return round(entropy, 4)


def _get_domain_age(domain: str) -> int:
    """
    Estimate the age of a domain in days.
    Uses a heuristic approach for fast batch processing.
    For real-time API calls, set ENABLE_WHOIS=True for live lookups.
    Returns -1 if unable to determine.
    """
    import os
    
    # Known established domains (age in days, approximate)
    known_domains = {
        'google.com': 9500, 'facebook.com': 7300, 'amazon.com': 10000,
        'microsoft.com': 11000, 'apple.com': 11000, 'github.com': 5800,
        'stackoverflow.com': 5500, 'wikipedia.org': 8000, 'linkedin.com': 7800,
        'twitter.com': 6500, 'youtube.com': 7000, 'reddit.com': 7000,
        'netflix.com': 9000, 'spotify.com': 5000, 'dropbox.com': 5500,
        'zoom.us': 3600, 'yahoo.com': 10500, 'bing.com': 5500,
    }
    
    # Clean domain
    clean = domain.lower()
    if clean.startswith('www.'):
        clean = clean[4:]
    
    if clean in known_domains:
        return known_domains[clean]
    
    # Only do live WHOIS if explicitly enabled (slow, for real-time API)
    if os.environ.get('ENABLE_WHOIS', '').lower() == 'true':
        try:
            w = whois.whois(domain)
            creation_date = w.creation_date
            if isinstance(creation_date, list):
                creation_date = creation_date[0]
            if creation_date:
                return (datetime.now() - creation_date).days
        except Exception:
            pass
    
    return -1


def _has_non_standard_port(parsed) -> int:
    """Check if the URL uses a non-standard port."""
    if parsed.port:
        if parsed.scheme == 'http' and parsed.port != 80:
            return 1
        if parsed.scheme == 'https' and parsed.port != 443:
            return 1
    return 0


def _is_shortened_url(domain: str) -> int:
    """Check if the URL is from a known URL shortening service."""
    shorteners = [
        'bit.ly', 'tinyurl.com', 'goo.gl', 't.co', 'ow.ly',
        'is.gd', 'buff.ly', 'adf.ly', 'tiny.cc', 'lnkd.in',
        'db.tt', 'qr.ae', 'cur.lv', 'ity.im', 'q.gs',
        'po.st', 'bc.vc', 'u.to', 'j.mp', 'buzurl.com',
        'cutt.us', 'rebrand.ly', 'rb.gy',
    ]
    return 1 if domain.lower() in shorteners else 0


def _get_default_features() -> dict:
    """Return default feature values when URL parsing fails."""
    return {
        'url_length': 0, 'domain_length': 0, 'path_length': 0,
        'num_dots': 0, 'num_hyphens': 0, 'num_underscores': 0,
        'num_slashes': 0, 'num_question_marks': 0, 'num_equals': 0,
        'num_at_signs': 0, 'num_ampersands': 0, 'num_exclamations': 0,
        'num_tildes': 0, 'num_digits': 0, 'num_letters': 0,
        'num_special_chars': 0, 'digit_letter_ratio': 0,
        'special_char_ratio': 0, 'has_ip_address': 0, 'has_https': 0,
        'num_subdomains': 0, 'has_www': 0, 'domain_has_digits': 0,
        'num_suspicious_keywords': 0, 'has_suspicious_keyword': 0,
        'has_suspicious_tld': 0, 'path_depth': 0,
        'has_double_slash_redirect': 0, 'query_length': 0,
        'num_query_params': 0, 'url_entropy': 0, 'domain_entropy': 0,
        'domain_age_days': -1, 'has_non_standard_port': 0,
        'is_shortened_url': 0, 'has_fragment': 0,
    }


def get_feature_names() -> list:
    """Return the list of all feature names in order."""
    return list(_get_default_features().keys())
