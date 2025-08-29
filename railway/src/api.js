import axios from 'axios';

// Security configuration
const SECURITY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 30000, // Increased timeout for login requests
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['xlsx', 'xls', 'csv'],
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  MAX_REQUESTS_PER_WINDOW: 100
};

// Rate limiting implementation
class RateLimiter {
  constructor() {
    this.requests = new Map();
  }

  isAllowed(endpoint) {
    const now = Date.now();
    const windowStart = now - SECURITY_CONFIG.RATE_LIMIT_WINDOW;
    
    if (!this.requests.has(endpoint)) {
      this.requests.set(endpoint, []);
    }
    
    const requests = this.requests.get(endpoint);
    const validRequests = requests.filter(time => time > windowStart);
    
    if (validRequests.length >= SECURITY_CONFIG.MAX_REQUESTS_PER_WINDOW) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    return true;
  }
}

const rateLimiter = new RateLimiter();

// Input sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
};

// Deep sanitization for objects
const deepSanitize = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepSanitize(item));
  }
  
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = deepSanitize(value);
  }
  return sanitized;
};

// Security interceptor for axios
axios.interceptors.request.use(
  (config) => {
    // Check rate limiting
    const endpoint = `${config.method?.toUpperCase() || 'GET'} ${config.url}`;
    if (!rateLimiter.isAllowed(endpoint)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }

    // Add security headers (removed Strict-Transport-Security to fix CORS)
    config.headers = {
      ...config.headers,
      'X-Requested-With': 'XMLHttpRequest',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin'
    };

    // Sanitize request data
    if (config.data && typeof config.data === 'object') {
      config.data = deepSanitize(config.data);
    }

    // Validate file uploads
    if (config.data instanceof FormData) {
      const file = config.data.get('file');
      if (file && file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum limit of ${SECURITY_CONFIG.MAX_FILE_SIZE / (1024 * 1024)}MB`);
      }
      
      if (file && !SECURITY_CONFIG.ALLOWED_FILE_TYPES.includes(file.name.split('.').pop().toLowerCase())) {
        throw new Error('Invalid file type. Only Excel and CSV files are allowed.');
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for security
axios.interceptors.response.use(
  (response) => {
    // Validate response headers
    const contentType = response.headers['content-type'];
    if (contentType && contentType.includes('text/html') && response.config.url.includes('/api/')) {
      throw new Error('Invalid response format detected');
    }
    
    return response;
  },
  (error) => {
    // Handle security-related errors
    if (error.response?.status === 429) {
      throw new Error('Too many requests. Please try again later.');
    }
    
    if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to perform this action.');
    }
    
    if (error.response?.status === 401) {
      // Clear invalid token
      localStorage.removeItem('token');
      window.location.href = '/login';
      throw new Error('Authentication required. Please log in again.');
    }
    
    return Promise.reject(error);
  }
);

// Prefer configured API URL. Fallback to same-origin or localhost for dev.
const getDefaultApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined') {
    const { protocol, hostname } = window.location;
    if (hostname && hostname !== 'localhost') {
      return `${protocol}//${hostname}/api`;
    }
  }
  return 'http://localhost:5000/api';
};

const API_URL = getDefaultApiUrl();

// Set default timeout for all requests
axios.defaults.timeout = SECURITY_CONFIG.REQUEST_TIMEOUT;

// Set auth token
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Use httpOnly cookie auth; include credentials
import.meta && (axios.defaults.withCredentials = true);

// Initialize auth header from localStorage on module load (browser only)
try {
  if (typeof window !== 'undefined' && window.localStorage) {
    const existingToken = window.localStorage.getItem('token');
    if (existingToken) {
      setAuthToken(existingToken);
    }
  }
} catch (_) {
  // ignore storage access errors
}

// Retry function with exponential backoff
const retryRequest = async (requestFn, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      if (attempt === maxRetries || error.response?.status >= 400) {
        throw error;
      }
      
      // Wait before retrying (exponential backoff)
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Connection health check
export const checkConnection = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { 
      timeout: 5000,
      headers: { 'X-Requested-With': 'XMLHttpRequest' }
    });
    return response.status === 200;
  } catch (error) {
    console.warn('Backend connection check failed:', error.message);
    return false;
  }
};

// Auth API with retry logic and connection check
export const register = async (userData) => {
  return retryRequest(() => axios.post(`${API_URL}/auth/register`, userData))
    .then(response => response.data);
};

export const login = async (userData) => {
  // First check connection health
  const isHealthy = await checkConnection();
  if (!isHealthy) {
    throw new Error('Backend server is not responding. Please try again later.');
  }
  
  return retryRequest(() => axios.post(`${API_URL}/auth/login`, userData))
    .then(response => response.data);
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data.user;
};

export const logout = () => {
  return axios.post(`${API_URL}/auth/logout`);
};

// Profile Update API with security measures
export const updateProfile = async (profileData) => {
  // Validate required fields
  if (!profileData.name || !profileData.email) {
    throw new Error('Name and email are required');
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(profileData.email)) {
    throw new Error('Invalid email format');
  }

  // Validate phone number if provided
  if (profileData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-\(\)]/g, ''))) {
    throw new Error('Invalid phone number format');
  }

  // Validate password requirements if changing password
  if (profileData.newPassword) {
    if (!profileData.currentPassword) {
      throw new Error('Current password is required to change password');
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(profileData.newPassword)) {
      throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
    }
  }

  // Sanitize data before sending
  const sanitizedData = {
    name: profileData.name.trim(),
    email: profileData.email.trim().toLowerCase(),
    phone: profileData.phone ? profileData.phone.trim() : undefined,
    address: profileData.address ? profileData.address.trim() : undefined,
  };

  // Add password data if changing password
  if (profileData.newPassword) {
    sanitizedData.currentPassword = profileData.currentPassword;
    sanitizedData.newPassword = profileData.newPassword;
  }

  try {
    const response = await axios.put(`${API_URL}/auth/profile`, sanitizedData, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000 // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication failed. Please log in again.');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied. You do not have permission to update this profile.');
    } else if (error.response?.status === 409) {
      throw new Error('Email already exists. Please use a different email address.');
    } else if (error.response?.status === 422) {
      throw new Error(error.response.data.message || 'Validation failed. Please check your input.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please try again.');
    } else {
      throw new Error('Failed to update profile. Please try again later.');
    }
  }
};

// Services API
export const getServices = async () => {
  const response = await axios.get(`${API_URL}/services`);
  return response.data.data;
};

export const searchServices = async (searchParams) => {
  const response = await axios.get(`${API_URL}/services/search`, { params: searchParams });
  return response.data.data;
};

export const createService = async (serviceData) => {
  const response = await axios.post(`${API_URL}/services`, serviceData);
  return response.data.data;
};

export const updateService = async (id, serviceData) => {
  const response = await axios.put(`${API_URL}/services/${id}`, serviceData);
  return response.data.data;
};

export const deleteService = async (id) => {
  const response = await axios.delete(`${API_URL}/services/${id}`);
  return response.data.data;
};

// Bookings API
export const createBooking = async (bookingData) => {
  const response = await axios.post(`${API_URL}/bookings`, bookingData);
  return response.data.data;
};

export const getUserBookings = async () => {
  const response = await axios.get(`${API_URL}/bookings`);
  return response.data.data;
};

// Admin Bookings
export const getAllBookings = async () => {
  const response = await axios.get(`${API_URL}/bookings/all`);
  return response.data.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/bookings/${id}/status`, { status });
  return response.data.data;
};

// Upload API
export const uploadExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(`${API_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

// Security API functions
export const changePassword = async (passwordData) => {
  // Validate password requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(passwordData.newPassword)) {
    throw new Error('Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character');
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    throw new Error('New passwords do not match');
  }

  try {
    const response = await axios.put(`${API_URL}/auth/password`, {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Current password is incorrect');
    } else if (error.response?.status === 422) {
      throw new Error(error.response.data.message || 'Password validation failed');
    } else {
      throw new Error('Failed to change password. Please try again.');
    }
  }
};

export const deleteAccount = async (passwordData) => {
  if (!passwordData.password) {
    throw new Error('Password is required to delete account');
  }

  try {
    const response = await axios.delete(`${API_URL}/auth/account`, {
      data: { password: passwordData.password },
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 15000
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Password is incorrect');
    } else if (error.response?.status === 422) {
      throw new Error(error.response.data.message || 'Account deletion validation failed');
    } else {
      throw new Error('Failed to delete account. Please try again.');
    }
  }
};

export const getSecurityLog = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth/security-log`, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });
    
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    } else if (error.response?.status === 403) {
      throw new Error('Access denied');
    } else {
      throw new Error('Failed to fetch security log');
    }
  }
};

export const enableTwoFactor = async () => {
  try {
    const response = await axios.post(`${API_URL}/auth/2fa/enable`, {}, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Authentication required');
    } else {
      throw new Error('Failed to enable two-factor authentication');
    }
  }
};

export const disableTwoFactor = async (passwordData) => {
  try {
    const response = await axios.post(`${API_URL}/auth/2fa/disable`, {
      password: passwordData.password
    }, {
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('Password is incorrect');
    } else {
      throw new Error('Failed to disable two-factor authentication');
    }
  }
};