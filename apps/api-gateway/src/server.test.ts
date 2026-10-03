import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import axios from 'axios';
import server from './server.js';

const API_URL = 'http://localhost:3000';
const client = axios.create({ baseURL: API_URL, validateStatus: () => true });

describe('API Gateway', () => {
  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  afterAll(async () => {
    server.close();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const res = await client.get('/health');
      expect(res.status).toBe(200);
      expect(res.data).toHaveProperty('status');
      expect(res.data).toHaveProperty('service', 'api-gateway');
      expect(res.data).toHaveProperty('upstream');
    });
  });

  describe('Rate Limiting', () => {
    it('should allow requests within limit', async () => {
      const res = await client.get('/health');
      expect(res.status).toBe(200);
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', async () => {
      const res = await client.get('/health');
      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await client.get('/unknown-route');
      expect(res.status).toBe(404);
      expect(res.data).toHaveProperty('error', 'Not Found');
    });
  });

  describe('Proxy Routes', () => {
    it('should proxy /auth requests', async () => {
      const res = await client.get('/auth/health');
      expect([200, 502, 503]).toContain(res.status);
    });

    it('should proxy /items requests', async () => {
      const res = await client.get('/items');
      expect([200, 502, 503]).toContain(res.status);
    });

    it('should proxy /sessions requests', async () => {
      const res = await client.get('/sessions');
      expect([200, 502, 503]).toContain(res.status);
    });
  });
});
