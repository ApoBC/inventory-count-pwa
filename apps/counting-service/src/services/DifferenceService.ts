import axios from 'axios';
import { INVENTORY_SERVICE_URL, RECOUNT_THRESHOLD_PERCENT, logger } from '../config.js';

export interface Difference {
  itemId: string;
  name: string;
  theoretical: number;
  counted: number;
  diff: number;
  diffPercent: number;
  requiresRecount: boolean;
}

export class DifferenceService {
  /**
   * Calcular diferencias entre stock teórico y contado
   */
  async calculateDifferences(sessionId: string, countsByItem: Map<string, number>): Promise<Difference[]> {
    try {
      const differences: Difference[] = [];

      // Para cada ítem contado, obtener stock teórico
      for (const [itemId, counted] of countsByItem) {
        try {
          // Obtener stock teórico de inventory-service
          const response = await axios.get(`${INVENTORY_SERVICE_URL}/stock`, {
            params: { itemId },
          });

          const levels = response.data.levels || [];

          // Si hay múltiples ubicaciones, sumar todas
          const theoretical = levels.reduce((sum: number, level: any) => sum + level.qty, 0);

          // Calcular diferencia
          const diff = counted - theoretical;
          const diffPercent = theoretical > 0 ? (diff / theoretical) * 100 : 0;
          const requiresRecount = Math.abs(diffPercent) > RECOUNT_THRESHOLD_PERCENT;

          differences.push({
            itemId,
            name: `Item ${itemId}`, // TODO: obtener nombre real
            theoretical,
            counted,
            diff,
            diffPercent: Math.round(diffPercent * 100) / 100, // 2 decimales
            requiresRecount,
          });

          logger.debug(
            { itemId, theoretical, counted, diff, diffPercent, requiresRecount },
            'Difference calculated'
          );
        } catch (error) {
          logger.warn({ itemId, error }, 'Failed to get stock for item');
          // Continuar con otros ítems
        }
      }

      return differences;
    } catch (error) {
      logger.error(error, 'Calculate differences failed');
      throw error;
    }
  }

  /**
   * Validar que diferencias sean razonables
   */
  validateDifferences(differences: Difference[]): boolean {
    for (const diff of differences) {
      // Rechazar diferencias absurdas (>200%)
      if (Math.abs(diff.diffPercent) > 200) {
        logger.warn({ itemId: diff.itemId, diffPercent: diff.diffPercent }, 'Unreasonable difference detected');
        return false;
      }
    }

    return true;
  }

  /**
   * Filtrar solo ítems con diferencia
   */
  getItemsWithDifference(differences: Difference[]): Difference[] {
    return differences.filter(d => d.diff !== 0);
  }

  /**
   * Contar ítems que requieren recuento
   */
  getRecountRequired(differences: Difference[]): Difference[] {
    return differences.filter(d => d.requiresRecount);
  }

  /**
   * Resumen de diferencias
   */
  getSummary(differences: Difference[]) {
    const withDiff = this.getItemsWithDifference(differences);
    const needsRecount = this.getRecountRequired(differences);

    return {
      totalItems: differences.length,
      itemsWithDifference: withDiff.length,
      itemsRequiringRecount: needsRecount.length,
      totalDiff: withDiff.reduce((sum, d) => sum + d.diff, 0),
      avgDiffPercent: withDiff.length > 0
        ? Math.round((withDiff.reduce((sum, d) => sum + d.diffPercent, 0) / withDiff.length) * 100) / 100
        : 0,
    };
  }
}
