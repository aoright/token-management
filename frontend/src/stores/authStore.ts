import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  
  login: async (credentials) => {
    // 模拟登录过程
    // 实际项目中这里会调用 API
    console.log('Login with:', credentials);
    
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    set({
      isAuthenticated: true,
      user: { id: '1', email: credentials.email, name: 'Demo User' }
    });
  },
  
  logout: () => {
    set({
      isAuthenticated: false,
      user: null
    });
  },
}));

export default useAuthStore;