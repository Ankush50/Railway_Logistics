import React, { createContext, useContext, useState, useEffect } from 'react';
import { securityLogger, validatePasswordStrength, validateInput } from '../utils/security';

const SecurityContext = createContext();

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

export const SecurityProvider = ({ children }) => {
  const [securityLevel, setSecurityLevel] = useState('medium');
  const [failedLoginAttempts, setFailedLoginAttempts] = useState(0);
  const [lastFailedLogin, setLastFailedLogin] = useState(null);
  const [isAccountLocked, setIsAccountLocked] = useState(false);
  const [securityAlerts, setSecurityAlerts] = useState([]);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Security configuration
  const SECURITY_CONFIG = {
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_EXPIRY_DAYS: 90,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    SECURITY_CHECK_INTERVAL: 60 * 1000 // 1 minute
  };

  // Initialize security context
  useEffect(() => {
    // Load security state from localStorage
    const loadSecurityState = () => {
      try {
        const storedState = localStorage.getItem('securityState');
        if (storedState) {
          const parsed = JSON.parse(storedState);
          setFailedLoginAttempts(parsed.failedLoginAttempts || 0);
          setLastFailedLogin(parsed.lastFailedLogin ? new Date(parsed.lastFailedLogin) : null);
          setTwoFactorEnabled(parsed.twoFactorEnabled || false);
        }
      } catch (error) {
        securityLogger.log('security_state_load_error', { error: error.message }, 'error');
      }
    };

    // Check for account lockout
    const checkAccountLockout = () => {
      if (lastFailedLogin && failedLoginAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        const timeSinceLastFailed = Date.now() - lastFailedLogin.getTime();
        if (timeSinceLastFailed < SECURITY_CONFIG.LOCKOUT_DURATION) {
          setIsAccountLocked(true);
        } else {
          // Reset lockout after duration
          setIsAccountLocked(false);
          setFailedLoginAttempts(0);
          setLastFailedLogin(null);
        }
      }
    };

    loadSecurityState();
    checkAccountLockout();

    // Set up periodic security checks
    const securityInterval = setInterval(checkAccountLockout, SECURITY_CONFIG.SECURITY_CHECK_INTERVAL);

    return () => clearInterval(securityInterval);
  }, [failedLoginAttempts, lastFailedLogin]);

  // Save security state to localStorage
  useEffect(() => {
    try {
      const securityState = {
        failedLoginAttempts,
        lastFailedLogin: lastFailedLogin?.toISOString(),
        twoFactorEnabled
      };
      localStorage.setItem('securityState', JSON.stringify(securityState));
    } catch (error) {
      securityLogger.log('security_state_save_error', { error: error.message }, 'error');
    }
  }, [failedLoginAttempts, lastFailedLogin, twoFactorEnabled]);

  // Security functions
  const recordFailedLogin = () => {
    const newAttempts = failedLoginAttempts + 1;
    setFailedLoginAttempts(newAttempts);
    setLastFailedLogin(new Date());
    
    securityLogger.log('failed_login_attempt', {
      attempts: newAttempts,
      timestamp: new Date().toISOString()
    }, 'warning');

    if (newAttempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
      setIsAccountLocked(true);
      securityLogger.log('account_locked', {
        reason: 'max_login_attempts_exceeded',
        timestamp: new Date().toISOString()
      }, 'critical');
      
      addSecurityAlert('Account temporarily locked due to multiple failed login attempts', 'critical');
    }
  };

  const recordSuccessfulLogin = () => {
    setFailedLoginAttempts(0);
    setLastFailedLogin(null);
    setIsAccountLocked(false);
    
    securityLogger.log('successful_login', {
      timestamp: new Date().toISOString()
    }, 'info');
  };

  const addSecurityAlert = (message, level = 'info', details = {}) => {
    const alert = {
      id: Date.now(),
      message,
      level,
      details,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    
    setSecurityAlerts(prev => [alert, ...prev.slice(0, 9)]); // Keep only 10 most recent
    
    securityLogger.log('security_alert', alert, level);
  };

  const acknowledgeAlert = (alertId) => {
    setSecurityAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const clearSecurityAlerts = () => {
    setSecurityAlerts([]);
  };

  const validatePassword = (password) => {
    const validation = validatePasswordStrength(password);
    
    if (!validation.isValid) {
      addSecurityAlert('Weak password detected', 'warning', validation);
    }
    
    return validation;
  };

  const validateInputField = (input, rules) => {
    const validation = validateInput(input, rules);
    
    if (!validation.isValid) {
      addSecurityAlert('Invalid input detected', 'warning', {
        input: input.substring(0, 50), // Truncate for security
        errors: validation.errors
      });
    }
    
    return validation;
  };

  const checkSecurityHealth = () => {
    const issues = [];
    
    if (failedLoginAttempts > 0) {
      issues.push(`Failed login attempts: ${failedLoginAttempts}`);
    }
    
    if (isAccountLocked) {
      issues.push('Account is currently locked');
    }
    
    if (!twoFactorEnabled && securityLevel === 'high') {
      issues.push('Two-factor authentication not enabled');
    }
    
    return {
      healthy: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 20))
    };
  };

  const updateSecurityLevel = (level) => {
    setSecurityLevel(level);
    securityLogger.log('security_level_changed', { 
      from: securityLevel, 
      to: level 
    }, 'info');
  };

  const enableTwoFactor = () => {
    setTwoFactorEnabled(true);
    securityLogger.log('2fa_enabled', {
      timestamp: new Date().toISOString()
    }, 'info');
    
    addSecurityAlert('Two-factor authentication enabled', 'success');
  };

  const disableTwoFactor = () => {
    setTwoFactorEnabled(false);
    securityLogger.log('2fa_disabled', {
      timestamp: new Date().toISOString()
    }, 'warning');
    
    addSecurityAlert('Two-factor authentication disabled', 'warning');
  };

  const getSecurityReport = () => {
    const health = checkSecurityHealth();
    const recentLogs = securityLogger.getLogs(null, 50);
    
    return {
      health,
      recentLogs,
      securityLevel,
      twoFactorEnabled,
      failedLoginAttempts,
      isAccountLocked,
      lastFailedLogin: lastFailedLogin?.toISOString(),
      timestamp: new Date().toISOString()
    };
  };

  const value = {
    // State
    securityLevel,
    failedLoginAttempts,
    lastFailedLogin,
    isAccountLocked,
    securityAlerts,
    twoFactorEnabled,
    
    // Configuration
    SECURITY_CONFIG,
    
    // Functions
    recordFailedLogin,
    recordSuccessfulLogin,
    addSecurityAlert,
    acknowledgeAlert,
    clearSecurityAlerts,
    validatePassword,
    validateInputField,
    checkSecurityHealth,
    updateSecurityLevel,
    enableTwoFactor,
    disableTwoFactor,
    getSecurityReport
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
