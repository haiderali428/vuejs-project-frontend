import api from './axios';
import { LoginCredentials, RegisterData, User } from '../types';

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ProfileUpdateResponse {
  message: string;
  user: User;
}

export interface DeleteAccountResponse {
  message: string;
  details?: {
    videosDeleted: number;
    filesDeleted: number;
  };
}

export const authAPI = {
  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/register', userData);
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Registration failed. Please try again.'
      );
    }
  },

  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/login', credentials);
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Login failed. Please check your credentials and try again.'
      );
    }
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData: { name: string; email: string }): Promise<ProfileUpdateResponse> {
    try {
      const response = await api.put<ProfileUpdateResponse>('/profile', profileData);
      return response.data;
    } catch (error: any) {
      console.error('Profile update API error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to update profile. Please try again.'
      );
    }
  },

  /**
   * Delete user account and all associated data
   */
  async deleteAccount(): Promise<DeleteAccountResponse> {
    try {
      const response = await api.delete<DeleteAccountResponse>('/account');
      return response.data;
    } catch (error: any) {
      console.error('Account deletion API error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to delete account. Please try again.'
      );
    }
  },

  /**
   * Validate token (optional - for token validation)
   */
  async validateToken(): Promise<{ valid: boolean; user?: User }> {
    try {
      // This would typically be a separate endpoint in your backend
      // For now, we'll try to get the user's profile as a way to validate the token
      const response = await api.get('/profile');
      return { valid: true, user: response.data.user };
    } catch (error: any) {
      console.error('Token validation error:', error);
      return { valid: false };
    }
  },

  /**
   * Refresh token (optional - for token refresh functionality)
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/refresh-token');
      return response.data;
    } catch (error: any) {
      console.error('Token refresh error:', error);
      throw new Error(
        error.response?.data?.error || 
        error.message || 
        'Failed to refresh token. Please log in again.'
      );
    }
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    // Basic token validation (you might want to add proper JWT decoding)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    return !isExpired;
  } catch {
    return false;
  }
};

// Utility function to get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error parsing user data from localStorage:', error);
    return null;
  }
};

// Utility function to logout user
export const logout = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Optional: Redirect to login page
  window.location.href = '/login';
};

// Utility function to set auth data after login/register
export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};