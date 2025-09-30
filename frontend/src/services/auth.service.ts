import api from './api';

export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export const authService = {
  // 用户登录
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // 用户注册
  async register(email: string, password: string, name?: string): Promise<AuthResponse> {
    const response = await api.post('/auth/register', { email, password, name });
    return response.data;
  },

  // 获取用户信息
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // 退出登录
  async logout(): Promise<ApiResponse<null>> {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  // 设置认证token
  setAuthToken(token: string) {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete api.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  },

  // 获取本地存储的token
  getStoredToken(): string | null {
    return localStorage.getItem('token');
  },

  // 清除认证信息
  clearAuth() {
    this.setAuthToken('');
    localStorage.removeItem('user');
  },

  // 检查是否已登录
  isAuthenticated(): boolean {
    const token = this.getStoredToken();
    return !!token;
  },
};