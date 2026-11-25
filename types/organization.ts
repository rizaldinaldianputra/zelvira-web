export interface Organization {
  id?: number;
  name: string;
  address?: string | null;
  phoneNumber?: string | null;
  email?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  youtubeUrl?: string | null;
  tiktokUrl?: string | null;
  playstoreUrl?: string | null;
  appstoreUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}
