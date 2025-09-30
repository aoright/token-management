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