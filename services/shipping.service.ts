import { apiClient } from './api.client';
import { ApiResponse } from '@/types/api';

export interface LocationItem {
  id?: number | string;
  name?: string;
  province_id?: number | string;
  province?: string;
  city_id?: number | string;
  city_name?: number | string;
  city?: string;
  type?: string;
  postal_code?: string;
  district_id?: number | string;
  district_name?: string;
  subdistrict_id?: number | string;
  subdistrict_name?: string;
}

export interface ShippingCostRequest {
  origin: string;
  destination: string;
  weight: number;
  courier: string;
}

export interface CourierResult {
  code: string;
  name: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

export interface TrackingManifestItem {
  manifest_code?: string;
  manifest_description: string;
  manifest_date: string;
  manifest_time: string;
  city_name?: string;
}

export interface TrackingResult {
  summary?: {
    courier_code?: string;
    courier_name?: string;
    waybill_number?: string;
    service_code?: string;
    waybill_date?: string;
    shipper_name?: string;
    receiver_name?: string;
    origin?: string;
    destination?: string;
    status?: string;
  };
  details?: any;
  delivery_status?: {
    status?: string;
    pod_receiver?: string;
    pod_date?: string;
    pod_time?: string;
  };
  manifest?: TrackingManifestItem[];
  history?: TrackingManifestItem[];
  error?: string;
}

class ShippingServiceClass {
  async getProvinces(): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>('/v1/shipping/provinces');
    return res.data || [];
  }

  async getCities(provinceId: string): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>(`/v1/shipping/cities?provinceId=${provinceId}`);
    return res.data || [];
  }

  async getDistricts(cityId: string): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>(`/v1/shipping/districts?cityId=${cityId}`);
    return res.data || [];
  }

  async getSubdistricts(districtId: string): Promise<LocationItem[]> {
    const res = await apiClient.get<ApiResponse<LocationItem[]>>(`/v1/shipping/sub-districts?districtId=${districtId}`);
    return res.data || [];
  }

  async calculateCost(request: ShippingCostRequest): Promise<CourierResult[]> {
    const res = await apiClient.post<ApiResponse<CourierResult[]>>('/v1/shipping/cost', request);
    return res.data || [];
  }

  async trackWaybill(awb: string, courier: string, phone?: string): Promise<TrackingResult | null> {
    const params = new URLSearchParams({ awb, courier });
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const last5 = cleanPhone.length >= 5 ? cleanPhone.slice(-5) : cleanPhone;
      if (last5) params.append('phone', last5);
    }
    const res = await apiClient.post<ApiResponse<any>>(`/v1/shipping/track?${params.toString()}`, {});
    // Extract data if wrapped
    const raw = res.data || res;
    if (raw && (raw.data || raw.rajaongkir?.result)) {
      const payload = raw.data || raw.rajaongkir?.result;
      return {
        summary: payload.summary,
        details: payload.details,
        delivery_status: payload.delivery_status,
        manifest: payload.manifest || payload.history || [],
      };
    }
    return raw as TrackingResult;
  }
}

export const ShippingService = new ShippingServiceClass();
