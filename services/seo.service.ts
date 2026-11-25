import { apiClient } from './api.client';
import { BaseService } from './base.service';
import { SeoConfig } from '@/types/seo';

class SeoServiceClass extends BaseService<SeoConfig> {
  private cache = new Map<string, SeoConfig | null>();
  private pendingRequests = new Map<string, Promise<SeoConfig | null>>();

  constructor() {
    super('/v1/seo-configs');
  }

  async getByPageName(pageName: string): Promise<SeoConfig | null> {
    if (!pageName) return null;

    if (this.cache.has(pageName)) {
      return this.cache.get(pageName) ?? null;
    }

    if (this.pendingRequests.has(pageName)) {
      return this.pendingRequests.get(pageName)!;
    }

    // During build, if the backend is not reachable, we skip SEO script injection
    // to prevent the build from hanging due to network timeouts.
    if (process.env.NODE_ENV === 'production' && typeof window === 'undefined' && !process.env.NEXT_PUBLIC_API_URL) {
      return null;
    }

    const requestPromise = (async () => {
      try {
        const response = await apiClient.get<any>(`${this.endpoint}/${pageName}`, { silent: true });
        const result = (response?.data ?? response) as SeoConfig | null;
        this.cache.set(pageName, result);
        return result;
      } catch (error: any) {
        // Cache null on 404 or network failure so it NEVER triggers an endless loop of requests
        this.cache.set(pageName, null);
        return null;
      } finally {
        this.pendingRequests.delete(pageName);
      }
    })();

    this.pendingRequests.set(pageName, requestPromise);
    return requestPromise;
  }

  async save(data: SeoConfig): Promise<SeoConfig> {
    if (data.pageName) {
      this.cache.delete(data.pageName);
    }
    const response = await apiClient.post<any>(this.endpoint, data);
    return response.data ?? response;
  }
}

export const SeoService = new SeoServiceClass();
