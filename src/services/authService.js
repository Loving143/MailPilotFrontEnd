import api from './api';

export const authService = {
  // Send OTP to email
  sendOtp: async (email) => {
    const response = await api.post('/api/auth/send-otp', { email });
    return response.data;
  },

  // Verify OTP and get JWT token
  verifyOtp: async (email, otp) => {
    const response = await api.post('/api/auth/verify-otp', { email, otp });
    return response.data;
  },

  // Send password reset link
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', null, {
      params: { email }
    });
    return response.data;
  },

  // Reset password with token
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/api/auth/reset-password', null, {
      params: { token, newPassword }
    });
    return response.data;
  },

  // Logout user
  logout: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await api.put('/api/user/logout', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    // Clear local storage regardless of API call success
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user info from token
  getCurrentUser: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        return JSON.parse(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        return null;
      }
    }
    return null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('token');
    return !!token;
  },

// Store auth data
  setAuthData: (token, userData = null) => {
    console.log('Setting auth data:', { token: token ? 'exists' : 'null', userData }); // Debug log
    localStorage.setItem('token', token);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  },

  // Clear auth data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};