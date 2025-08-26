import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Set auth token
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Initialize token from localStorage on first import
const existingToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
if (existingToken) {
  setAuthToken(existingToken);
}

// Auth API
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/register`, userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const login = async (userData) => {
  const response = await axios.post(`${API_URL}/auth/login`, userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    setAuthToken(response.data.token);
  }
  return response.data;
};

export const getMe = async () => {
  const response = await axios.get(`${API_URL}/auth/me`);
  return response.data.user;
};

export const logout = () => {
  localStorage.removeItem('token');
  setAuthToken(null);
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