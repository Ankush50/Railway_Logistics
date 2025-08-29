// Security utility functions

// Password strength validation
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[@$!%*?&]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

  return {
    isValid: score >= 4,
    score,
    strength,
    checks
  };
};

// Input validation and sanitization
export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim();
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
};

// Session security
export const generateSecureToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const validateToken = (token) => {
  return token && token.length >= 64 && /^[a-f0-9]+$/i.test(token);
};

// CSRF protection
export const generateCSRFToken = () => {
  return generateSecureToken();
};

export const validateCSRFToken = (token, storedToken) => {
  return token && storedToken && token === storedToken;
};

// File security
export const validateFileType = (file, allowedTypes) => {
  const extension = file.name.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

export const validateFileSize = (file, maxSize) => {
  return file.size <= maxSize;
};

// XSS prevention
export const escapeHtml = (str) => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

export const unescapeHtml = (str) => {
  const div = document.createElement('div');
  div.innerHTML = str;
  return div.textContent;
};

// SQL injection prevention (for client-side validation)
export const containsSQLKeywords = (str) => {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', '--', '/*', '*/', ';'
  ];
  
  const upperStr = str.toUpperCase();
  return sqlKeywords.some(keyword => upperStr.includes(keyword));
};

// Rate limiting helper
export class ClientSideRateLimiter {
  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    if (!this.requests.has(key)) {
      this.requests.set(key, []);
    }
    
    const requests = this.requests.get(key);
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }

  reset(key) {
    this.requests.delete(key);
  }
}

// Security audit logging
export class SecurityLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(event, details = {}, severity = 'info') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      details,
      severity,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.logs.push(logEntry);
    
    // Keep only recent logs
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log(`[Security] ${event}:`, logEntry);
    }

    // Send to server if available
    this.sendToServer(logEntry);
  }

  async sendToServer(logEntry) {
    try {
      // This would typically send to your security monitoring service
      // For now, we'll just store it locally
      localStorage.setItem('securityLogs', JSON.stringify(this.logs.slice(-100)));
    } catch (error) {
      console.error('Failed to send security log to server:', error);
    }
  }

  getLogs(severity = null, limit = 100) {
    let filteredLogs = this.logs;
    if (severity) {
      filteredLogs = this.logs.filter(log => log.severity === severity);
    }
    return filteredLogs.slice(-limit);
  }

  clearLogs() {
    this.logs = [];
  }
}

// Export a default instance
export const securityLogger = new SecurityLogger();

// Security middleware for React components
export const withSecurity = (Component) => {
  return (props) => {
    // Log component access
    securityLogger.log('component_access', {
      component: Component.name || 'Unknown',
      props: Object.keys(props)
    });

    return <Component {...props} />;
  };
};

// Input validation middleware
export const validateInput = (input, rules) => {
  const errors = [];
  
  if (rules.required && !input) {
    errors.push('This field is required');
  }
  
  if (rules.minLength && input && input.length < rules.minLength) {
    errors.push(`Minimum length is ${rules.minLength} characters`);
  }
  
  if (rules.maxLength && input && input.length > rules.maxLength) {
    errors.push(`Maximum length is ${rules.maxLength} characters`);
  }
  
  if (rules.pattern && input && !rules.pattern.test(input)) {
    errors.push(rules.patternMessage || 'Invalid format');
  }
  
  if (rules.custom && typeof rules.custom === 'function') {
    const customError = rules.custom(input);
    if (customError) {
      errors.push(customError);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};
