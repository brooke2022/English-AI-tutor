import { create } from 'zustand';
import { AxiosError } from 'axios';
import { User, RegisterStudentData, RegisterTeacherData } from '../types';
import { api, apiGet, apiPost, setAccessToken, getAccessToken } from '../lib/api';
import { queryClient } from '../lib/queryClient';

type ApiRole = 'STUDENT' | 'TEACHER' | 'ADMIN';
type ClientRole = 'student' | 'teacher' | 'admin';

interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: ApiRole;
  timezone: string;
  avatarUrl?: string | null;
  createdAt?: string;
}

interface AuthResponse {
  accessToken: string;
  user: ApiUser;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterStudentData | RegisterTeacherData, role: 'student' | 'teacher') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
  bootstrap: () => Promise<void>;
}

function normalizeUser(u: ApiUser): User {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role.toLowerCase() as ClientRole,
    timezone: u.timezone,
    avatar: u.avatarUrl ?? undefined,
    createdAt: u.createdAt ?? new Date().toISOString(),
  };
}

function extractError(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string') return msg;
  }
  return fallback;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: getAccessToken(),
  isAuthenticated: !!getAccessToken(),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiPost<AuthResponse>('/auth/login', { email, password });
      setAccessToken(res.accessToken);
      set({
        user: normalizeUser(res.user),
        token: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Invalid email or password.') });
    }
  },

  register: async (data, role) => {
    set({ isLoading: true, error: null });
    try {
      const body: Record<string, unknown> = {
        email: data.email,
        password: data.password,
        name: data.name,
        role: role.toUpperCase(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      if (role === 'student') {
        const s = data as RegisterStudentData;
        body.nativeLanguage = s.nativeLanguage;
        body.learningGoals = s.learningGoals;
      } else {
        const t = data as RegisterTeacherData;
        body.country = t.country;
        body.intro = t.intro;
        body.tags = t.tags;
        body.hourlyRate = t.price;
        body.trialPrice = t.trialPrice;
        body.countryCode = (t as { countryCode?: string }).countryCode;
      }
      const res = await apiPost<AuthResponse>('/auth/register', body);
      setAccessToken(res.accessToken);
      set({
        user: normalizeUser(res.user),
        token: res.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Registration failed.') });
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore
    }
    setAccessToken(null);
    queryClient.clear();
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  updateProfile: async (data) => {
    set({ isLoading: true });
    try {
      const body: Record<string, unknown> = {};
      if (data.name !== undefined) body.name = data.name;
      if (data.timezone !== undefined) body.timezone = data.timezone;
      if (data.avatar !== undefined) body.avatarUrl = data.avatar;
      const res = await api.patch<ApiUser>('/users/me', body);
      set((state) => ({
        user: state.user ? { ...state.user, ...normalizeUser(res.data) } : normalizeUser(res.data),
        isLoading: false,
      }));
    } catch (err) {
      set({ isLoading: false, error: extractError(err, 'Update failed.') });
    }
  },

  clearError: () => set({ error: null }),

  bootstrap: async () => {
    if (!getAccessToken()) return;
    try {
      const me = await apiGet<ApiUser>('/auth/me');
      set({ user: normalizeUser(me), isAuthenticated: true });
    } catch {
      // Token might be expired and refresh failed → clear
      setAccessToken(null);
      set({ user: null, token: null, isAuthenticated: false });
    }
    void get();
  },
}));

// Bootstrap on app load
void useAuthStore.getState().bootstrap();
