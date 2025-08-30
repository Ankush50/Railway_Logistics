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
export const getAllBookings = async () => {
  const response = await axios.get(`${API_URL}/bookings/all`);
  return response.data.data;
};

export const updateBookingStatus = async (id, status) => {
  const response = await axios.put(`${API_URL}/bookings/${id}/status`, { status });
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
    
    console.log('Uploading to:', `${API_URL}/profile/upload-picture`);
    console.log('File:', file.name, file.size, file.type);
    console.log('API URL:', API_URL);
    
    const response = await axios.post(`${API_URL}/profile/upload-picture`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      timeout: 30000 // 30 second timeout
    });
    
    console.log('Upload response:', response.data);
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
  const baseUrl = API_URL.replace('/api', '');
  return userId ? `${baseUrl}/api/profile/picture/${userId}` : `${baseUrl}/api/profile/picture`;
};