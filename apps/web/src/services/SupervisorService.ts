import { api } from '@/lib/api';
import { CountingSession } from '@/types';

export interface CountingDifference {
  itemId: string;
  name: string;
  theoretical: number;
  counted: number;
  diff: number;
  diffPercent: number;
  requiresRecount: boolean;
}

export interface SessionDetail extends CountingSession {
  operatorName?: string;
  counts?: number;
  differences?: CountingDifference[];
}

export interface ApprovalResult {
  success: boolean;
  sessionId: string;
  journalId: string;
  itemsAdjusted: number;
  postedAt: string;
}

class SupervisorService {
  /**
   * Obtener todas las sesiones de conteo
   */
  async getCountingSessions(filter?: {
    status?: 'OPEN' | 'CLOSED' | 'APPROVED';
    warehouse?: string;
    operatorId?: string;
  }): Promise<SessionDetail[]> {
    try {
      // TODO: Implementar endpoint en Counting Service
      // const sessions = await api.get<SessionDetail[]>('/sessions', { params: filter });
      // Por ahora retornar array vacío
      return [];
    } catch (error) {
      console.error('Error obteniendo sesiones:', error);
      throw error;
    }
  }

  /**
   * Obtener detalles de una sesión específica
   */
  async getSessionDetail(sessionId: string): Promise<SessionDetail> {
    try {
      const session = await api.get<SessionDetail>(`/sessions/${sessionId}`);
      return session;
    } catch (error) {
      console.error('Error obteniendo detalles de sesión:', error);
      throw error;
    }
  }

  /**
   * Obtener diferencias (teórico vs contado) de una sesión
   */
  async getSessionDifferences(sessionId: string): Promise<CountingDifference[]> {
    try {
      const response = await api.get<{
        sessionId: string;
        differences: CountingDifference[];
      }>(`/sessions/${sessionId}/differences`);

      return response.differences || [];
    } catch (error) {
      console.error('Error obteniendo diferencias:', error);
      throw error;
    }
  }

  /**
   * Obtener conteos de una sesión (para auditoría)
   */
  async getSessionCounts(sessionId: string): Promise<any[]> {
    try {
      const response = await api.get<{
        sessionId: string;
        counts: any[];
      }>(`/sessions/${sessionId}/counts`);

      return response.counts || [];
    } catch (error) {
      console.error('Error obteniendo conteos:', error);
      throw error;
    }
  }

  /**
   * Aprobar sesión de conteo y enviar a ERP
   */
  async approveSession(
    sessionId: string,
    supervisorId: string,
    adjustments?: { itemId: string; adjustment: number }[]
  ): Promise<ApprovalResult> {
    try {
      const result = await api.post<ApprovalResult>(
        `/sessions/${sessionId}/approve`,
        {
          supervisorId,
          adjustments,
        }
      );

      return result;
    } catch (error) {
      console.error('Error aprobando sesión:', error);
      throw error;
    }
  }

  /**
   * Calcular resumen de diferencias
   */
  calculateSummary(differences: CountingDifference[]): {
    totalItems: number;
    itemsWithDifference: number;
    itemsRequiringRecount: number;
    totalDiff: number;
    avgDiffPercent: number;
    maxDiff: CountingDifference | null;
    minDiff: CountingDifference | null;
  } {
    const withDiff = differences.filter(d => d.diff !== 0);
    const requireRecount = differences.filter(d => d.requiresRecount);
    const maxDiff = withDiff.length > 0
      ? withDiff.reduce((max, d) => Math.abs(d.diff) > Math.abs(max.diff) ? d : max)
      : null;
    const minDiff = withDiff.length > 0
      ? withDiff.reduce((min, d) => Math.abs(d.diff) < Math.abs(min.diff) ? d : min)
      : null;

    return {
      totalItems: differences.length,
      itemsWithDifference: withDiff.length,
      itemsRequiringRecount: requireRecount.length,
      totalDiff: differences.reduce((sum, d) => sum + d.diff, 0),
      avgDiffPercent:
        differences.length > 0
          ? differences.reduce((sum, d) => sum + d.diffPercent, 0) / differences.length
          : 0,
      maxDiff,
      minDiff,
    };
  }

  /**
   * Obtener estadísticas de sesiones
   */
  async getStatistics(filter?: {
    startDate?: string;
    endDate?: string;
    warehouse?: string;
  }): Promise<{
    totalSessions: number;
    openSessions: number;
    closedSessions: number;
    approvedSessions: number;
    avgItemsPerSession: number;
    avgDiffPercent: number;
  }> {
    try {
      // TODO: Implementar endpoint
      // const stats = await api.get('/sessions/statistics', { params: filter });
      // Por ahora retornar valores por defecto
      return {
        totalSessions: 0,
        openSessions: 0,
        closedSessions: 0,
        approvedSessions: 0,
        avgItemsPerSession: 0,
        avgDiffPercent: 0,
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw error;
    }
  }
}

export const supervisorService = new SupervisorService();
