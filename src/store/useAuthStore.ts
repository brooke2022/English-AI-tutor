import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, RegisterStudentData, RegisterTeacherData } from '../types';

const MOCK_USERS: (User & { password: string })[] = [
  {
    id: 'user-student-1',
    email: 'student@test.com',
    password: 'password123',
    name: 'Alex Chen',
    role: 'student',
    timezone: 'Asia/Shanghai',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-teacher-1',
    email: 'teacher@test.com',
    password: 'password123',
    name: 'Maria Santos',
    role: 'teacher',
    timezone: 'Asia/Manila',
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-admin-1',
    email: 'admin@tutorai.com',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    timezone: 'UTC',
    createdAt: '2026-01-01T00:00:00Z',
  },
];

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterStudentData | RegisterTeacherData, role: 'student' | 'teacher') => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 800));
        const found = MOCK_USERS.find((u) => u.email === email && u.password === password);
        if (!found) {
          set({ isLoading: false, error: 'Invalid email or password.' });
          return;
        }
        const { password: _p, ...user } = found;
        set({ user, token: `mock-token-${user.id}`, isAuthenticated: true, isLoading: false });
      },

      register: async (data, role) => {
        set({ isLoading: true, error: null });
        await new Promise((r) => setTimeout(r, 1000));
        const user: User = {
          id: `user-${Date.now()}`,
          email: data.email,
          name: data.name,
          role,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          createdAt: new Date().toISOString(),
        };
        set({ user, token: `mock-token-${user.id}`, isAuthenticated: true, isLoading: false });
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false, error: null }),

      updateProfile: async (data) => {
        set({ isLoading: true });
        await new Promise((r) => setTimeout(r, 600));
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
          isLoading: false,
        }));
      },

      clearError: () => set({ error: null }),
    }),
    { name: 'ai-tutor-auth' }
  )
);
