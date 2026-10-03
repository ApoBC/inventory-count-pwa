import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
    });

    this.setupInterceptors();
    this.loadTokens();
  }

  private setupInterceptors() {
    // Request interceptor - agregar JWT
    this.client.interceptors.request.use(
      config => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      error => Promise.reject(error)
    );

    // Response interceptor - manejar token expirado
    this.client.interceptors.response.use(
      response => response,
      async error => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            if (this.refreshToken) {
              const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                { refreshToken: this.refreshToken },
                { timeout: 30000 }
              );

              this.accessToken = response.data.accessToken;
              this.refreshToken = response.data.refreshToken;
              this.saveTokens();

              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private loadTokens() {
    const stored = sessionStorage.getItem('auth_tokens');
    if (stored) {
      const { accessToken, refreshToken } = JSON.parse(stored);
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
    }
  }

  public saveTokens(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    sessionStorage.setItem('auth_tokens', JSON.stringify({ accessToken, refreshToken }));
  }

  public clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    sessionStorage.removeItem('auth_tokens');
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  // Métodos públicos con retry automático
  public async get<T>(url: string, config?: any): Promise<T> {
    return this.withRetry(() => this.client.get<T>(url, config)) as Promise<T>;
  }

  public async post<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.withRetry(() => this.client.post<T>(url, data, config)) as Promise<T>;
  }

  public async put<T>(url: string, data?: any, config?: any): Promise<T> {
    return this.withRetry(() => this.client.put<T>(url, data, config)) as Promise<T>;
  }

  public async delete<T>(url: string, config?: any): Promise<T> {
    return this.withRetry(() => this.client.delete<T>(url, config)) as Promise<T>;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries = 0): Promise<T> {
    try {
      const response = await fn();
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;

      // No reintentar en 4xx (excepto 408, 429)
      if (axiosError.response?.status && axiosError.response.status >= 400 && axiosError.response.status < 500) {
        if (![408, 429].includes(axiosError.response.status)) {
          throw error;
        }
      }

      if (retries < MAX_RETRIES) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS * (retries + 1)));
        return this.withRetry(fn, retries + 1);
      }

      throw error;
    }
  }
}

export const api = new ApiClient();
