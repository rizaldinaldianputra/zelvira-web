import { apiClient } from './api.client';
import { Organization } from '@/types/organization';

class OrganizationServiceClass {
  private endpoint = '/organization';

  async get(): Promise<Organization> {
    const response = await apiClient.get<Organization>(this.endpoint);
    return response;
  }

  async update(data: Partial<Organization>): Promise<Organization> {
    const response = await apiClient.post<Organization>(this.endpoint, data);
    return response;
  }
}

export const OrganizationService = new OrganizationServiceClass();
