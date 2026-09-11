/**
 * CineMind AI - Authentication State & Flow Controller
 */

class AuthService {
  constructor() {
    this.api = window.api;
  }

  isLoggedIn() {
    return !!this.api.getToken();
  }

  getUser() {
    return this.api.getUser();
  }

  async login(identifier, password) {
    try {
      const res = await this.api.post('/auth/login', { identifier, password });
      if (res.success && res.token) {
        this.api.setToken(res.token);
        this.api.setUser(res.user);
        return res;
      }
      throw new Error(res.message || 'Login failed.');
    } catch (err) {
      throw err;
    }
  }

  async register(registrationData) {
    try {
      const res = await this.api.post('/auth/register', registrationData);
      if (res.success && res.token) {
        this.api.setToken(res.token);
        this.api.setUser(res.user);
        return res;
      }
      throw new Error(res.message || 'Registration failed.');
    } catch (err) {
      throw err;
    }
  }

  async checkSession() {
    if (!this.isLoggedIn()) return null;
    try {
      const res = await this.api.get('/auth/me');
      if (res.success && res.user) {
        this.api.setUser(res.user);
        return res.user;
      }
    } catch {
      this.api.removeToken();
    }
    return null;
  }

  logout() {
    this.api.removeToken();
    if (window.showToast) {
      window.showToast('You have been signed out.', 'info');
    }
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 500);
  }

  requireAuth(redirectUrl = null) {
    if (!this.isLoggedIn()) {
      const current = redirectUrl || (window.location.pathname + window.location.search);
      window.location.href = `/login.html?redirect=${encodeURIComponent(current)}`;
      return false;
    }
    return true;
  }

  requireAdmin() {
    if (!this.requireAuth()) return false;
    const user = this.getUser();
    if (!user || user.role !== 'admin') {
      window.location.href = '/dashboard.html';
      return false;
    }
    return true;
  }

  redirectIfLoggedIn(target = '/dashboard.html') {
    if (this.isLoggedIn()) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      window.location.href = redirect ? decodeURIComponent(redirect) : target;
      return true;
    }
    return false;
  }
}

const auth = new AuthService();
window.auth = auth;
