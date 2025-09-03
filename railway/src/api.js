import axios from 'axios';

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

// Auth API
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  return response.data;
};

export const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data.user;
};

export const logout = () => {
  return axios.post(`${API_URL}/auth/logout`);
};

// Profile Update API
export const updateProfile = async (profileData) => {
  const response = await axios.put(`${API_URL}/auth/profile`, profileData);
  return response.data;
};

export const changePassword = async (passwordData) => {
  const response = await axios.put(`${API_URL}/auth/password`, passwordData);
  return response.data;
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
export const getAllBookings = async (archived = false) => {
  const response = await axios.get(`${API_URL}/bookings/all?archived=${archived}`);
  return response.data.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/bookings/${id}/status`, { status });
  return response.data.data;
};

export const toggleArchiveBooking = async (id, archived) => {
  const response = await axios.put(`${API_URL}/bookings/${id}/archive`, { archived });
  return response.data.data;
};

export const requestCancellation = async (id) => {
  const response = await axios.put(`${API_URL}/bookings/${id}/cancel-request`);
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

// Profile Picture API
export const uploadProfilePicture = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await axios.post(`${API_URL}/profile/upload-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 second timeout
    });
    
    return response.data;
  } catch (error) {
    console.error('Upload error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      }
    });
    
    // Provide more specific error messages
    if (error.response?.status === 500) {
      throw new Error('Server error: Please try again later or contact support.');
    } else if (error.response?.status === 413) {
      throw new Error('File too large: Please select a smaller image (max 5MB).');
    } else if (error.response?.status === 400) {
      throw new Error(error.response.data?.message || 'Invalid file format. Please select an image file.');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Upload timeout: Please check your connection and try again.');
    } else if (!error.response) {
      throw new Error('Network error: Please check your connection and try again.');
    } else {
      throw new Error(error.response.data?.message || 'Upload failed. Please try again.');
    }
  }
};

export const getProfilePicture = async (userId = null) => {
  const url = userId ? `${API_URL}/profile/picture/${userId}` : `${API_URL}/profile/picture`;
  const response = await axios.get(url);
  return response.data;
};

export const deleteProfilePicture = async () => {
  const response = await axios.delete(`${API_URL}/profile/picture`);
  return response.data;
};

// Helper function to get profile picture URL
export const getProfilePictureUrl = (userId = null) => {
  // For development, use localhost, for production use the actual domain
  let baseUrl;
  if (API_URL.includes('localhost')) {
    baseUrl = 'http://localhost:5000';
  } else if (API_URL.includes('onrender.com')) {
    baseUrl = 'https://turbotransit-backend.onrender.com';
  } else {
    baseUrl = API_URL.replace('/api', '');
  }
  
  const url = userId ? `${baseUrl}/api/profile/picture/${userId}` : `${baseUrl}/api/profile/picture`;
  return url;
};

// Notification API
export const getNotifications = async () => {
  const response = await axios.get(`${API_URL}/notifications`);
  return response.data.data;
};

export const getUnreadCount = async () => {
  const response = await axios.get(`${API_URL}/notifications/unread-count`);
  return response.data.data.count;
};

export const markNotificationAsRead = async (id) => {
  const response = await axios.put(`${API_URL}/notifications/${id}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await axios.put(`${API_URL}/notifications/mark-all-read`);
  return response.data;
};

// Payments API
export const createPaymentOrder = async (bookingId) => {
  const response = await axios.post(`${API_URL}/payments/order`, { bookingId });
  return response.data.data; // { orderId, amount, currency, key }
};

export const verifyPayment = async ({ bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  const response = await axios.post(`${API_URL}/payments/verify`, {
    bookingId,
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  });
  return response.data.data;
};

export const downloadReceiptPdf = (bookingId) => {
  const baseUrl = API_URL.replace('/api', '');
  const url = `${baseUrl}/api/payments/receipt/${bookingId}`;
  window.open(url, '_blank', 'noopener,noreferrer');
};