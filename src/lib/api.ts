import axios, { AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

let accessToken: string | null = null;
const ACCESS_TOKEN_STORAGE = 'tutor-access-token';

// Try to load token from storage on boot (refresh-page survival)
try {
  accessToken = localStorage.getItem(ACCESS_TOKEN_STORAGE);
} catch {
  // ignore
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null) {
  accessToken = token;
  try {
    if (token) localStorage.setItem(ACCESS_TOKEN_STORAGE, token);
    else localStorage.removeItem(ACCESS_TOKEN_STORAGE);
  } catch {
    // ignore quota / private mode errors
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send refresh-token cookie
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let refreshing: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  try {
    const res = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    );
    const newToken: string | undefined = res.data?.accessToken;
    if (!newToken) return null;
    setAccessToken(newToken);
    return newToken;
  } catch {
    setAccessToken(null);
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes('/auth/')
    ) {
      original._retry = true;
      refreshing ??= performRefresh().finally(() => {
        refreshing = null;
      });
      const newToken = await refreshing;
      if (newToken) {
        original.headers = original.headers ?? {};
        (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        return api.request(original);
      }
    }
    return Promise.reject(error);
  },
);

// Convenience helpers
export const apiGet = <T>(url: string, config?: AxiosRequestConfig) =>
  api.get<T>(url, config).then((r) => r.data);

export const apiPost = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
  api.post<T>(url, body, config).then((r) => r.data);

export const apiPatch = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
  api.patch<T>(url, body, config).then((r) => r.data);

export const apiPut = <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
  api.put<T>(url, body, config).then((r) => r.data);
