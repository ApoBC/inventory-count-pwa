export interface User {
  id: string;
  username: string;
  email?: string;
  role: 'OPERATOR' | 'SUPERVISOR';
  active: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
}

export interface StockLevel {
  id: string;
  productId: string;
  warehouse: string;
  location?: string;
  qty: number;
  lastCountedAt?: string;
}

export interface CountingSession {
  id: string;
  warehouse: string;
  location?: string;
  operatorId: string;
  status: 'OPEN' | 'CLOSED' | 'APPROVED';
  createdAt: string;
  closedAt?: string;
  approvedAt?: string;
}

export interface Count {
  id: string;
  sessionId: string;
  clientId: string;
  itemId: string;
  qty: number;
  synced: boolean;
  timestamp: string;
}

export interface SyncQueueItem {
  id: string;
  type: 'count' | 'session_approval';
  payload: unknown;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
  createdAt: number;
  lastRetryAt?: number;
}
