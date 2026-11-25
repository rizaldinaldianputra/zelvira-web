export interface AuthUser {
  id?: number | string;
  token: string;
  email: string;
  fullName: string;
  profilePicture?: string;
  phoneNumber?: string;
  balance?: number;
  points?: number;
  roles: string[];
  taskGroup?: string;
}

export interface LoginResponse extends AuthUser {}
