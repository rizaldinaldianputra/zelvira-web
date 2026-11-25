import { apiClient } from './api.client';
import { AuthUser } from '@/types/auth';
export type { AuthUser } from '@/types/auth';

export const authService = {
  isLoggedIn: (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('zelixa_token');
    return !!token && token !== 'undefined' && token !== 'null';
  },

  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('zelixa_token');
    return token && token !== 'undefined' && token !== 'null' ? token : null;
  },

  getUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('zelixa_user');
    return user ? JSON.parse(user) : null;
  },

  fetchMe: async (): Promise<AuthUser> => {
    const response = await apiClient.get<any>('/v1/auth/me');
    const data = response.data;

    // Merge with existing token if possible
    const existingUser = authService.getUser();
    const updatedUser = {
      ...data,
      token: authService.getToken() || (existingUser?.token || '')
    };

    localStorage.setItem('zelixa_user', JSON.stringify(updatedUser));
    
    if (typeof document !== 'undefined') {
      const role = updatedUser.roles?.includes('ROLE_ADMIN') ? 'ROLE_ADMIN' : 'ROLE_USER';
      document.cookie = `zelixa_role=${role}; path=/; max-age=86400; SameSite=Lax`;
    }

    window.dispatchEvent(new Event('auth-change'));
    return updatedUser;
  },

  isAdmin: (): boolean => {
    const user = authService.getUser();
    return !!user?.roles?.includes('ROLE_ADMIN');
  },

  login: async (credentials: any): Promise<AuthUser> => {
    const response = await apiClient.post<any>('/v1/auth/login', credentials);
    const data = response.data;

    if (data.token) {
      localStorage.setItem('zelixa_token', data.token);

      if (typeof document !== 'undefined') {
        document.cookie = `zelixa_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }
      
      return await authService.fetchMe();
    }
    return data;
  },

  register: async (userData: any): Promise<AuthUser> => {
    const response = await apiClient.post<any>('/v1/auth/register', userData);
    const data = response.data;

    if (data.token) {
      localStorage.setItem('zelixa_token', data.token);

      if (typeof document !== 'undefined') {
        document.cookie = `zelixa_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      return await authService.fetchMe();
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('zelixa_token');
    localStorage.removeItem('zelixa_user');

    if (typeof document !== 'undefined') {
      document.cookie = 'zelixa_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
      document.cookie = 'zelixa_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }

    window.dispatchEvent(new Event('auth-change'));
  },

  handleOAuthSuccess: async (token: string): Promise<AuthUser | null> => {
    localStorage.setItem('zelixa_token', token);

    // Also set cookie for middleware support
    if (typeof document !== 'undefined') {
      document.cookie = `zelixa_token=${token}; path=/; max-age=86400; SameSite=Lax`;
    }

    // Fetch user data immediately after success
    try {
      const user = await authService.fetchMe();
      return user;
    } catch (error) {
      console.error('Failed to fetch user data after OAuth success:', error);
      window.dispatchEvent(new Event('auth-change'));
      return null;
    }
  },

  requestOtp: async (phoneNumber: string): Promise<void> => {
    await apiClient.post('/v1/auth/otp/request', { phoneNumber });
  },

  loginWithOtp: async (phoneNumber: string, code: string): Promise<AuthUser> => {
    const response = await apiClient.post<any>('/v1/auth/otp/login', { phoneNumber, code });
    const data = response.data;

    if (data.token) {
      localStorage.setItem('zelixa_token', data.token);

      if (typeof document !== 'undefined') {
        document.cookie = `zelixa_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      return await authService.fetchMe();
    }
    return data;
  },

  loginWithGoogle: async (idToken: string): Promise<AuthUser> => {
    const response = await apiClient.post<any>('/v1/auth/google', { idToken });
    const data = response?.data || response;

    if (data?.token) {
      localStorage.setItem('zelixa_token', data.token);

      if (typeof document !== 'undefined') {
        document.cookie = `zelixa_token=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      }

      return await authService.fetchMe();
    }
    return data;
  },

  requestForgotPasswordOtp: async (email: string): Promise<string> => {
    const response = await apiClient.post<any>('/v1/auth/forgot-password/request', { email });
    return response?.message || 'Kode OTP reset password telah dikirim ke email Anda.';
  },

  verifyForgotPasswordOtp: async (email: string, code: string): Promise<string> => {
    const response = await apiClient.post<any>('/v1/auth/forgot-password/verify', { email, code });
    return response?.message || 'Kode OTP valid.';
  },

  resetPasswordWithOtp: async (email: string, code: string, newPassword: string): Promise<string> => {
    const response = await apiClient.post<any>('/v1/auth/forgot-password/reset', {
      email,
      code,
      newPassword,
    });
    return response?.message || 'Password berhasil diubah. Silakan login kembali dengan password baru.';
  },

  updateFcmToken: async (fcmToken: string): Promise<void> => {
    try {
      await apiClient.post('/v1/auth/me/fcm-token', { fcmToken });
      console.log('[FCM] Token synced successfully with backend');
    } catch (error) {
      console.error('[FCM] Failed to sync token with backend:', error);
    }
  },

  updateProfile: async (data: { fullName?: string; phoneNumber?: string }): Promise<AuthUser> => {
    await apiClient.put<any>('/v1/auth/me', data);
    return await authService.fetchMe();
  },

  updateProfilePicture: async (file: File): Promise<AuthUser> => {
    const formData = new FormData();
    formData.append('file', file);
    await apiClient.post<any>('/v1/auth/me/picture', formData);
    return await authService.fetchMe();
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.put<any>('/v1/auth/me/password', { currentPassword, newPassword });
  },

  deleteAccount: async (): Promise<void> => {
    await apiClient.delete<any>('/v1/auth/me');
    authService.logout();
  }
};

