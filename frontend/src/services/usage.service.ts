import api from './api';

export interface UsageLog {
  id: string;
  platformId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  requestId?: string;
  metadata?: any;
  createdAt: string;
}

export interface UsageStats {
  total: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  today: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
}

export interface UsageFilter {
  platformId?: string;
  startDate?: string;
  endDate?: string;
  model?: string;
  page?: number;
  limit?: number;
}

export const usageService = {
  // 获取使用记录
  getLogs: async (filter: UsageFilter): Promise<{ logs: UsageLog[]; pagination: any }> => {
    const params = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/usage/logs?${params.toString()}`);
    return response.data;
  },

  // 获取统计数据
  getStats: async (platformId?: string): Promise<UsageStats> => {
    const params = platformId ? `?platformId=${platformId}` : '';
    const response = await api.get(`/usage/stats${params}`);
    return response.data;
  },

  // 上报使用数据
  reportUsage: async (data: Partial<UsageLog>): Promise<UsageLog> => {
    const response = await api.post('/usage/report', data);
    return response.data;
  },
};