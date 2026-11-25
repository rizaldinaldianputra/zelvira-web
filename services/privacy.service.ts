import { BaseService } from './base.service';
import { apiClient } from './api.client';

export interface PrivacyPolicy {
  id?: number;
  title: string;
  content: string;
  active?: boolean;
  isActive?: boolean;
  updatedAt?: string;
  createdAt?: string;
}

class PrivacyPolicyServiceClass extends BaseService<PrivacyPolicy> {
  constructor() {
    super('/v1/privacy-policy');
  }

  async getActive(): Promise<PrivacyPolicy | null> {
    try {
      const response = await apiClient.get<any>('/v1/privacy-policy/active', { silent: true });
      const data = response?.data ?? response;
      if (data && (data.content || data.title)) {
        return data;
      }
    } catch {
      // Ignore initial error and try fallbacks
    }

    try {
      const response = await apiClient.get<any>('/v1/privacy-policy/current', { silent: true });
      const data = response?.data ?? response;
      if (data && data.isActive !== false && (data.content || data.title)) {
        return data;
      }
    } catch {
      // Ignore
    }

    try {
      const response = await apiClient.get<any>('/v1/privacy-policy?onlyActive=true', { silent: true });
      const list = Array.isArray(response) ? response : response?.data ?? response?.content ?? [];
      if (Array.isArray(list) && list.length > 0) {
        return list[0];
      }
    } catch {
      // Ignore
    }

    return null;
  }
}

export const PrivacyPolicyService = new PrivacyPolicyServiceClass();
