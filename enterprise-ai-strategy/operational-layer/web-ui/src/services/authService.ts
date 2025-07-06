/**
 * Authentication Service
 * Handles user login, logout, and token management
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export class AuthService {
  private static readonly TOKEN_KEY = 'enterprise_ai_token';
  private static readonly USER_KEY = 'enterprise_ai_user';
  private static readonly API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<User> {
    try {
      const response = await fetch(`${this.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const loginData: LoginResponse = await response.json();
      
      // Store token
      localStorage.setItem(this.TOKEN_KEY, loginData.access_token);

      // Get user info
      const userInfo = await this.getCurrentUserInfo();
      
      // Store user info
      localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));

      return userInfo;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Get current user from localStorage
   */
  static getCurrentUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Get current user info from API
   */
  static async getCurrentUserInfo(): Promise<User> {
    const token = this.getToken();
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${this.API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return response.json();
  }

  /**
   * Get stored authentication token
   */
  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  /**
   * Get authorization headers for API requests
   */
  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
  }

  /**
   * Check if current user has required role
   */
  static hasRole(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    // Admin has access to everything
    if (user.role === 'admin') return true;

    // Manager has access to most things
    if (requiredRole === 'manager' && user.role === 'manager') return true;

    // Exact role match
    return user.role === requiredRole;
  }

  /**
   * Check if token is expired (basic check)
   */
  static isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Decode JWT payload (basic implementation)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Refresh authentication status
   */
  static async refreshAuth(): Promise<User | null> {
    if (this.isTokenExpired()) {
      this.logout();
      return null;
    }

    try {
      const userInfo = await this.getCurrentUserInfo();
      localStorage.setItem(this.USER_KEY, JSON.stringify(userInfo));
      return userInfo;
    } catch {
      this.logout();
      return null;
    }
  }
}