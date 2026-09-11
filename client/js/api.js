/**
 * CineMind AI - Centralized API Service Client
 * Handles HTTP requests, JWT token attachment, and centralized error interception.
 */

const API_BASE_URL = '/api';

class ApiClient {
  constructor() {
    this.tokenKey = 'cinemind_jwt_token';
    this.userKey = 'cinemind_user_data';
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  setToken(token) {
    localStorage.setItem(this.tokenKey, token);
  }

  removeToken() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getUser() {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  setUser(user) {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      // Handle 401 Unauthorized - Session Expired
      if (response.status === 401) {
        // If not already on auth pages, redirect
        const isAuthPage = window.location.pathname.includes('login') || window.location.pathname.includes('register');
        if (!isAuthPage && token) {
          this.removeToken();
          if (window.showToast) {
            window.showToast('Your session has expired. Please sign in again.', 'error');
          }
          setTimeout(() => {
            window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          }, 1200);
        }
      }

      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.message || `API Error: ${response.status}`);
        error.status = response.status;
        error.data = data;
        error.remainingSeconds = data.remainingSeconds;
        error.lockout = data.lockout;
        throw error;
      }

      return data;
    } catch (err) {
      console.error(`[API Request Error] ${options.method || 'GET'} ${endpoint}:`, err);
      throw err;
    }
  }

  get(endpoint, params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });
    const qs = query.toString();
    return this.request(`${endpoint}${qs ? `?${qs}` : ''}`, { method: 'GET' });
  }

  post(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const api = new ApiClient();
window.api = api;
