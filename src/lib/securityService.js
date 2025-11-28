// src/lib/securityService.js
// Security utilities for authentication, validation, and protection

import { supabase } from './supabase';

class SecurityService {
  // ============================================
  // 1. PASSWORD VALIDATION & STRENGTH
  // ============================================
  
  /**
   * Validate password meets security requirements
   * Requires: 12+ chars, uppercase, lowercase, number, special char
   */
  validatePassword(password) {
    const requirements = {
      minLength: password.length >= 12,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req === true);
    
    return {
      isValid,
      requirements,
      strengthScore: this.calculatePasswordStrength(password)
    };
  }
  
  /**
   * Calculate password strength (0-100)
   */
  calculatePasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 12) strength += 20;
    if (password.length >= 16) strength += 10;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[a-z]/.test(password)) strength += 15;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    if (/[\s]/.test(password) === false) strength += 5; // No spaces
    
    return Math.min(100, strength);
  }
  
  // ============================================
  // 2. INPUT SANITIZATION & VALIDATION
  // ============================================
  
  /**
   * Sanitize string input to prevent XSS
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }
  
  /**
   * Validate email format
   */
  validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email) && email.length <= 254;
  }
  
  /**
   * Validate URL (same origin only)
   */
  validateRedirectUrl(url) {
    try {
      const parsed = new URL(url);
      return parsed.origin === window.location.origin;
    } catch {
      return false;
    }
  }
  
  /**
   * Validate phone number (basic format)
   */
  validatePhoneNumber(phone) {
    const regex = /^[\d\s\-\+\(\)]{10,20}$/;
    return regex.test(phone.replace(/\s/g, ''));
  }
  
  /**
   * Sanitize and validate username
   */
  validateUsername(username) {
    if (!username || username.length < 3) return false;
    if (username.length > 50) return false;
    // Only alphanumeric, underscore, hyphen
    return /^[a-zA-Z0-9_-]+$/.test(username);
  }
  
  // ============================================
  // 3. RATE LIMITING
  // ============================================
  
  /**
   * Track login attempts to prevent brute force
   * Returns: {allowed: boolean, attemptsLeft: number}
   */
  checkLoginAttempt(email) {
    const MAX_ATTEMPTS = 5;
    const WINDOW_MINUTES = 15;
    
    const key = `login_attempts_${email}`;
    const stored = localStorage.getItem(key);
    
    let attempts = [];
    if (stored) {
      try {
        attempts = JSON.parse(stored);
      } catch {
        attempts = [];
      }
    }
    
    const now = Date.now();
    const windowMs = WINDOW_MINUTES * 60 * 1000;
    
    // Remove old attempts outside window
    attempts = attempts.filter(time => now - time < windowMs);
    
    if (attempts.length >= MAX_ATTEMPTS) {
      return {
        allowed: false,
        attemptsLeft: 0,
        message: `Too many login attempts. Try again in ${WINDOW_MINUTES} minutes.`
      };
    }
    
    attempts.push(now);
    localStorage.setItem(key, JSON.stringify(attempts));
    
    return {
      allowed: true,
      attemptsLeft: MAX_ATTEMPTS - attempts.length,
      message: null
    };
  }
  
  /**
   * Check API rate limit (generic)
   */
  checkRateLimit(key, maxRequests = 100, windowSeconds = 60) {
    const storageKey = `rate_limit_${key}`;
    const stored = localStorage.getItem(storageKey);
    
    let requests = [];
    if (stored) {
      try {
        requests = JSON.parse(stored);
      } catch {
        requests = [];
      }
    }
    
    const now = Date.now();
    const windowMs = windowSeconds * 1000;
    
    requests = requests.filter(time => now - time < windowMs);
    
    if (requests.length >= maxRequests) {
      return {
        allowed: false,
        requestsLeft: 0,
        resetIn: Math.ceil((requests[0] + windowMs - now) / 1000)
      };
    }
    
    requests.push(now);
    localStorage.setItem(storageKey, JSON.stringify(requests));
    
    return {
      allowed: true,
      requestsLeft: maxRequests - requests.length,
      resetIn: 0
    };
  }
  
  // ============================================
  // 4. SECURITY LOGGING
  // ============================================
  
  /**
   * Log security events to database
   */
  async logSecurityEvent(eventType, details = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const logEntry = {
        event_type: eventType,
        user_id: user?.id || null,
        user_email: user?.email || null,
        ip_address: details.ipAddress || 'unknown',
        user_agent: navigator.userAgent,
        details: details,
        timestamp: new Date().toISOString()
      };
      
      // Log to security_logs table (if it exists)
      await supabase.from('security_logs').insert(logEntry);
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }
  
  /**
   * Log authentication attempt
   */
  async logAuthAttempt(email, success, reason = null) {
    await this.logSecurityEvent('AUTH_ATTEMPT', {
      email,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  }
  
  /**
   * Log data access
   */
  async logDataAccess(resourceType, resourceId, action) {
    await this.logSecurityEvent('DATA_ACCESS', {
      resourceType,
      resourceId,
      action, // 'READ', 'CREATE', 'UPDATE', 'DELETE'
      timestamp: new Date().toISOString()
    });
  }
  
  // ============================================
  // 5. FILE UPLOAD SECURITY
  // ============================================
  
  /**
   * Validate file before upload
   */
  async validateFileUpload(file) {
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_TYPES = {
      'image/jpeg': ['ffd8ff'],
      'image/png': ['89504e47'],
      'application/pdf': ['25504446'],
      'image/webp': ['52494646']
    };
    
    // Check file size
    if (file.size > MAX_SIZE) {
      throw new Error('File size exceeds 5MB limit');
    }
    
    // Check file type
    if (!Object.keys(ALLOWED_TYPES).includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, WebP, PDF allowed');
    }
    
    // Check file signature (magic bytes)
    const header = await this.readFileHeader(file, 4);
    const validSignatures = ALLOWED_TYPES[file.type];
    const isValidSignature = validSignatures.some(sig => 
      header.startsWith(sig)
    );
    
    if (!isValidSignature) {
      throw new Error('File content does not match extension (possible spoofing)');
    }
    
    return true;
  }
  
  /**
   * Read file header for signature validation
   */
  async readFileHeader(file, bytes = 4) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arr = new Uint8Array(e.target.result).subarray(0, bytes);
        let header = '';
        for (let i = 0; i < arr.length; i++) {
          header += ('0' + arr[i].toString(16)).slice(-2);
        }
        resolve(header);
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file.slice(0, bytes));
    });
  }
  
  // ============================================
  // 6. SESSION MANAGEMENT
  // ============================================
  
  /**
   * Setup auto-logout on inactivity
   */
  setupInactivityTimeout(minutesOfInactivity = 30) {
    const TIMEOUT_MS = minutesOfInactivity * 60 * 1000;
    let inactivityTimer;
    
    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      inactivityTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
      }, TIMEOUT_MS);
    };
    
    // Listen for user activity
    ['mousemove', 'keypress', 'click', 'touchstart', 'scroll'].forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });
    
    // Initial timer
    resetTimer();
  }
  
  // ============================================
  // 7. ENCRYPTION UTILITIES
  // ============================================
  
  /**
   * Simple hash for non-sensitive data (not for passwords!)
   * Use bcrypt on backend for passwords
   */
  async hashString(str) {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // ============================================
  // 8. XSS & INJECTION PREVENTION
  // ============================================
  
  /**
   * Check if string contains potential XSS patterns
   */
  containsXSSPatterns(str) {
    const xssPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(str));
  }
  
  /**
   * Check if string contains potential SQL injection patterns
   */
  containsSQLPatterns(str) {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/gi,
      /(-{2}|\/\*|\*\/)/,
      /(;|'|")/
    ];
    
    return sqlPatterns.some(pattern => pattern.test(str));
  }
  
  /**
   * Warn about suspicious patterns (not a replacement for server validation)
   */
  validateInputSafety(input) {
    const warnings = [];
    
    if (this.containsXSSPatterns(input)) {
      warnings.push('Potential XSS pattern detected');
    }
    
    if (this.containsSQLPatterns(input)) {
      warnings.push('Potential SQL injection pattern detected');
    }
    
    return {
      safe: warnings.length === 0,
      warnings
    };
  }
}

export default new SecurityService();
