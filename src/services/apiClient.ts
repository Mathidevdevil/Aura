// In-memory access token store
let inMemoryAccessToken: string | null = null;
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

export interface ApiErrorProblem {
  type?: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  detail: string;

  constructor(problem: ApiErrorProblem) {
    super(problem.detail || problem.title || 'An error occurred');
    this.name = 'ApiError';
    this.status = problem.status;
    this.code = problem.code;
    this.detail = problem.detail;
  }
}

export function setAccessToken(token: string | null) {
  inMemoryAccessToken = token;
}

export function getAccessToken(): string | null {
  return inMemoryAccessToken;
}

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

let onUnauthorizedCallback: (() => void) | null = null;
export function setOnUnauthorized(cb: () => void) {
  onUnauthorizedCallback = cb;
}

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '') || '/api/v1';

export async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${cleanEndpoint}`;
  
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (inMemoryAccessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${inMemoryAccessToken}`);
  }

  // Include credentials (cookies for refresh tokens and CSRF)
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: any) {
    throw new ApiError({
      title: 'Network Error',
      status: 0,
      detail: 'Unable to connect to the authentication server.',
      code: 'NETWORK_ERROR',
    });
  }

  // Handle 401 Unauthorized with token refresh (avoid infinite loop if refresh itself is 401)
  if (response.status === 401 && !endpoint.includes('/auth/refresh') && !endpoint.includes('/auth/login')) {
    if (isRefreshing) {
      // Queue concurrent requests
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((newToken) => {
        if (newToken) {
          headers.set('Authorization', `Bearer ${newToken}`);
        }
        return fetch(url, { ...options, headers, credentials: 'include' }).then(res => res.json());
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      if (!refreshRes.ok) {
        throw new Error('Refresh failed');
      }

      const refreshData = await refreshRes.json();
      const newToken = refreshData.accessToken;
      setAccessToken(newToken);
      processQueue(null, newToken);

      // Retry original request with new token
      headers.set('Authorization', `Bearer ${newToken}`);
      const retryRes = await fetch(url, { ...options, headers, credentials: 'include' });
      return retryRes.json();
    } catch (refreshErr) {
      processQueue(new Error('Session expired'), null);
      setAccessToken(null);
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      throw new ApiError({
        title: 'Session Expired',
        status: 401,
        detail: 'Your session has expired. Please sign in again.',
        code: 'AUTH_SESSION_EXPIRED',
      });
    } finally {
      isRefreshing = false;
    }
  }

  // Parse RFC 7807 response on error
  if (!response.ok) {
    let errorProblem: ApiErrorProblem;
    try {
      const data = await response.json();
      errorProblem = {
        title: data.title || response.statusText,
        status: data.status || response.status,
        detail: data.detail || data.message || 'An unexpected error occurred.',
        code: data.code || `HTTP_${response.status}`,
      };
    } catch {
      errorProblem = {
        title: response.statusText,
        status: response.status,
        detail: `Request failed with status ${response.status}`,
        code: `HTTP_${response.status}`,
      };
    }
    throw new ApiError(errorProblem);
  }

  // 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

