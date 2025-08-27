// Mock authentication module for Base44 SDK
import storage from './storage.js';

class Auth {
  constructor() {
    this.currentUser = null;
    this.token = null;
    this.loadAuth();
  }

  loadAuth() {
    const authData = storage.getAuth();
    this.currentUser = authData.user;
    this.token = authData.token;
  }

  async login(email, password) {
    // Mock authentication - in a real app, this would call an API
    // For demo purposes, accept any email/password
    const user = {
      id: storage.generateId(),
      email,
      name: email.split('@')[0],
      role: 'baker',
      created_at: new Date().toISOString()
    };

    const token = this.generateMockToken();
    
    this.currentUser = user;
    this.token = token;
    
    storage.setAuth({ user, token });
    
    return { user, token };
  }

  async signup(data) {
    const { email, password, name, ...otherData } = data;
    
    // Check if user already exists
    const authData = storage.getAuth();
    if (authData.user && authData.user.email === email) {
      throw new Error('User with this email already exists');
    }

    const user = {
      id: storage.generateId(),
      email,
      name: name || email.split('@')[0],
      role: 'baker',
      created_at: new Date().toISOString(),
      ...otherData
    };

    const token = this.generateMockToken();
    
    this.currentUser = user;
    this.token = token;
    
    storage.setAuth({ user, token });
    
    return { user, token };
  }

  async logout() {
    this.currentUser = null;
    this.token = null;
    storage.clearAuth();
  }

  getUser() {
    return this.currentUser;
  }

  getToken() {
    return this.token;
  }

  isAuthenticated() {
    return !!this.token && !!this.currentUser;
  }

  generateMockToken() {
    // Generate a mock JWT-like token
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      sub: storage.generateId(), 
      iat: Date.now(), 
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }));
    const signature = btoa(Math.random().toString(36).substring(2));
    
    return `${header}.${payload}.${signature}`;
  }

  // Check if request requires authentication
  requiresAuth(options) {
    return options.requiresAuth === true;
  }
}

export default new Auth();