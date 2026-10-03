import bcryptjs from 'bcryptjs';
import { logger } from '../config.js';

const BCRYPT_ROUNDS = 10;

export class PasswordService {
  /**
   * Hash una contraseña con bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const hashed = await bcryptjs.hash(password, BCRYPT_ROUNDS);
      logger.debug('Password hashed');
      return hashed;
    } catch (error) {
      logger.error(error, 'Failed to hash password');
      throw error;
    }
  }

  /**
   * Verificar contraseña contra hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      const isValid = await bcryptjs.compare(password, hash);
      return isValid;
    } catch (error) {
      logger.error(error, 'Failed to verify password');
      throw error;
    }
  }
}
