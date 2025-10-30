export interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Video {
  id: number;
  title: string;
  description: string;
  video_url: string;
  video_type: 'file' | 'link';
  user_id: number;
  user_name?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface VideoFormData {
  title: string;
  description: string;
  video_url: string;
  video_type: 'file' | 'link';
}