import api from './api';

export interface Platform {
  id: string;
  name: string;
  provider: string;
  apiKeyEncrypted: string;
  baseUrl?: string;
  pricingConfig: {
    input: number;
    output: number;
  };
  monthlyQuota?: number;
  alertThreshold: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const platformService = {
  // 获取所有平台
  getAll: async (): Promise<Platform[]> => {
    const response = await api.get('/platforms');
    return response.data;
  },

  // 创建平台
  create: async (data: Partial<Platform>): Promise<Platform> => {
    const response = await api.post('/platforms', data);
    return response.data;
  },

  // 更新平台
  update: async (id: string, data: Partial<Platform>): Promise<Platform> => {
    const response = await api.put(`/platforms/${id}`, data);
    return response.data;
  },

  // 删除平台
  delete: async (id: string): Promise<void> => {
    await api.delete(`/platforms/${id}`);
  },
};