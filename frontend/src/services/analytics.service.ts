import api from './api';

export interface DailyAnalytics {
  date: string;
  totalTokens: number;
  estimatedCost: number;
}

export const analyticsService = {
  // 获取每日分析数据
  getDaily: async (days: number = 30, platformId?: string): Promise<DailyAnalytics[]> => {
    const params = new URLSearchParams();
    params.append('days', days.toString());
    if (platformId) {
      params.append('platformId', platformId);
    }

    const response = await api.get(`/analytics/daily?${params.toString()}`);
    return response.data;
  },
};