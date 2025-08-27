// Additional security middleware
const securityMiddleware = (req, res, next) => {
  // Remove sensitive headers
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  // Add security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  res.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  res.set('X-Permitted-Cross-Domain-Policies', 'none');
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  
  // Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent XSS attacks
  res.set('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Request logging for security monitoring - Less verbose
const securityLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user ? req.user.id : 'anonymous'
    };
    
    // Only log warnings for actual errors (not 404s for root path)
    if (res.statusCode >= 400 && req.url !== '/') {
      console.warn('Security Warning:', logData);
    }
    
    // Log all requests but less verbose for normal operations
    if (res.statusCode >= 400 || req.url === '/health' || req.url.startsWith('/api/')) {
      console.log('Request:', logData);
    }
  });
  
  next();
};

// Block suspicious user agents - Less aggressive
const blockSuspiciousUserAgents = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  
  // Only block obviously malicious user agents
  const maliciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /w3af/i,
    /burpsuite/i,
    /zap/i,
    /acunetix/i,
    /nessus/i,
    /openvas/i,
    /metasploit/i
  ];
  
  const isMalicious = maliciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isMalicious) {
    console.warn('Malicious user agent blocked:', userAgent);
    return res.status(403).json({
      success: false,
      message: 'Access denied - malicious request detected'
    });
  }
  
  next();
};

// Validate request origin - Less restrictive
const validateOrigin = (req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'https://turbotransit1.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5000'
  ];
  
  // Allow requests without origin header (like direct API calls)
  if (!origin) {
    return next();
  }
  
  if (!allowedOrigins.includes(origin)) {
    console.warn('Origin not allowed:', origin);
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed'
    });
  }
  
  next();
};

// Anti-phishing protection - Less aggressive
const antiPhishingProtection = (req, res, next) => {
  // Only check for obvious phishing patterns in form submissions
  if (req.method === 'POST' && req.path.includes('/auth/')) {
    const body = JSON.stringify(req.body || {}).toLowerCase();
    const suspiciousPatterns = [
      /credit.?card/i,
      /ssn/i,
      /social.?security/i,
      /bank.?account/i,
      /routing.?number/i,
      /account.?number/i,
      /pin/i,
      /cvv/i,
      /expiry/i
    ];
    
    const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
      pattern.test(body)
    );
    
    if (hasSuspiciousContent) {
      console.warn('Potential phishing attempt detected:', {
        url: req.url,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(403).json({
        success: false,
        message: 'Access denied - suspicious request pattern detected'
      });
    }
  }
  
  next();
};

// Block file upload attacks
const blockFileUploadAttacks = (req, res, next) => {
  if (req.files || req.file) {
    const files = req.files || [req.file];
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    const hasInvalidFile = files.some(file => {
      if (!file.mimetype || !allowedTypes.includes(file.mimetype)) {
        console.warn('Invalid file type attempted:', file.mimetype);
        return true;
      }
      return false;
    });
    
    if (hasInvalidFile) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type - only images, PDFs, and Excel files allowed'
      });
    }
  }
  
  next();
};

module.exports = {
  securityMiddleware,
  securityLogger,
  blockSuspiciousUserAgents,
  validateOrigin,
  antiPhishingProtection,
  blockFileUploadAttacks
};
