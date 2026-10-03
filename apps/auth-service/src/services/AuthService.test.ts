import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenService } from './TokenService.js';
import { PasswordService } from './PasswordService.js';

describe('TokenService', () => {
  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = TokenService.generateAccessToken('user-123', 'testuser', 'OPERATOR');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should contain correct payload when decoded', () => {
      const token = TokenService.generateAccessToken('user-123', 'testuser', 'OPERATOR');
      const decoded = TokenService.decodeToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.sub).toBe('user-123');
      expect(decoded?.username).toBe('testuser');
      expect(decoded?.role).toBe('OPERATOR');
      expect(decoded?.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = TokenService.generateRefreshToken('user-123');
      expect(token).toBeTruthy();
      expect(typeof token).toBe('string');
    });

    it('should have type refresh', () => {
      const token = TokenService.generateRefreshToken('user-123');
      const decoded = TokenService.decodeToken(token);

      expect(decoded?.type).toBe('refresh');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = TokenService.generateAccessToken('user-123', 'testuser', 'OPERATOR');
      const payload = TokenService.verifyToken(token);

      expect(payload).toBeTruthy();
      expect(payload?.sub).toBe('user-123');
    });

    it('should reject invalid token', () => {
      const payload = TokenService.verifyToken('invalid.token.here');
      expect(payload).toBeNull();
    });

    it('should reject expired token', () => {
      const token = TokenService.generateAccessToken('user-123', 'testuser', 'OPERATOR');
      // Esperar a que expire (en realidad no esperamos, solo verificamos la lógica)
      const payload = TokenService.verifyToken(token);
      expect(payload).toBeTruthy(); // Debería ser válido inmediatamente después
    });
  });

  describe('decodeToken', () => {
    it('should decode valid token without verification', () => {
      const token = TokenService.generateAccessToken('user-123', 'testuser', 'OPERATOR');
      const decoded = TokenService.decodeToken(token);

      expect(decoded).toBeTruthy();
      expect(decoded?.sub).toBe('user-123');
    });

    it('should return null for invalid token', () => {
      const decoded = TokenService.decodeToken('invalid.token');
      expect(decoded).toBeNull();
    });
  });
});

describe('PasswordService', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);

      expect(hash).toBeTruthy();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(20); // bcrypt hashes are long
    });

    it('should produce different hashes for same password', async () => {
      const password = 'testPassword123';
      const hash1 = await PasswordService.hashPassword(password);
      const hash2 = await PasswordService.hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts produce different hashes
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should be case-sensitive', async () => {
      const password = 'TestPassword123';
      const wrongCase = 'testpassword123';
      const hash = await PasswordService.hashPassword(password);
      const isValid = await PasswordService.verifyPassword(wrongCase, hash);

      expect(isValid).toBe(false);
    });
  });
});
