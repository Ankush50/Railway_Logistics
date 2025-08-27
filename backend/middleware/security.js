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
  res.set('Cross-Origin-Embedder-Policy', 'require-corp');
  res.set('Cross-Origin-Opener-Policy', 'same-origin');
  res.set('Cross-Origin-Resource-Policy', 'same-origin');
  
  // Prevent clickjacking
  res.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing
  res.set('X-Content-Type-Options', 'nosniff');
  
  // Prevent XSS attacks
  res.set('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Request logging for security monitoring
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
    
    // Log suspicious activities
    if (res.statusCode >= 400) {
      console.warn('Security Warning:', logData);
    }
    
    // Log all requests for monitoring
    console.log('Request:', logData);
  });
  
  next();
};

// Block suspicious user agents
const blockSuspiciousUserAgents = (req, res, next) => {
  const userAgent = req.get('User-Agent') || '';
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /java/i,
    /perl/i,
    /ruby/i,
    /php/i,
    /go-http-client/i,
    /http-client/i,
    /okhttp/i,
    /apache-httpclient/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !req.path.startsWith('/api/')) {
    return res.status(403).json({
      success: false,
      message: 'Access denied for automated requests'
    });
  }
  
  next();
};

// Validate request origin
const validateOrigin = (req, res, next) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'https://turbotransit1.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  if (origin && !allowedOrigins.includes(origin)) {
    return res.status(403).json({
      success: false,
      message: 'Origin not allowed'
    });
  }
  
  next();
};

// Anti-phishing protection
const antiPhishingProtection = (req, res, next) => {
  // Block requests with suspicious patterns
  const suspiciousPatterns = [
    /password/i,
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
  
  const url = req.url.toLowerCase();
  const body = JSON.stringify(req.body || {}).toLowerCase();
  
  const hasSuspiciousContent = suspiciousPatterns.some(pattern => 
    pattern.test(url) || pattern.test(body)
  );
  
  if (hasSuspiciousContent && !req.path.startsWith('/api/auth/')) {
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
