import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supervisorService, CountingDifference } from './SupervisorService';

describe('SupervisorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateSummary', () => {
    it('debe retornar resumen correcto para array vacío', () => {
      const summary = supervisorService.calculateSummary([]);

      expect(summary).toEqual({
        totalItems: 0,
        itemsWithDifference: 0,
        itemsRequiringRecount: 0,
        totalDiff: 0,
        avgDiffPercent: 0,
        maxDiff: null,
        minDiff: null,
      });
    });

    it('debe contar items con diferencia correctamente', () => {
      const differences: CountingDifference[] = [
        {
          itemId: 'PROD-001',
          name: 'Product A',
          theoretical: 100,
          counted: 100,
          diff: 0,
          diffPercent: 0,
          requiresRecount: false,
        },
        {
          itemId: 'PROD-002',
          name: 'Product B',
          theoretical: 50,
          counted: 45,
          diff: -5,
          diffPercent: -10,
          requiresRecount: true,
        },
        {
          itemId: 'PROD-003',
          name: 'Product C',
          theoretical: 200,
          counted: 205,
          diff: 5,
          diffPercent: 2.5,
          requiresRecount: false,
        },
      ];

      const summary = supervisorService.calculateSummary(differences);

      expect(summary.totalItems).toBe(3);
      expect(summary.itemsWithDifference).toBe(2);
      expect(summary.itemsRequiringRecount).toBe(1);
      expect(summary.totalDiff).toBe(0); // -5 + 5
      expect(summary.avgDiffPercent).toBeCloseTo(-2.5, 1); // (-10 + 2.5) / 3
    });

    it('debe identificar maxDiff y minDiff correctamente', () => {
      const differences: CountingDifference[] = [
        {
          itemId: 'PROD-001',
          name: 'Product A',
          theoretical: 100,
          counted: 50,
          diff: -50,
          diffPercent: -50,
          requiresRecount: true,
        },
        {
          itemId: 'PROD-002',
          name: 'Product B',
          theoretical: 100,
          counted: 110,
          diff: 10,
          diffPercent: 10,
          requiresRecount: false,
        },
      ];

      const summary = supervisorService.calculateSummary(differences);

      expect(summary.maxDiff?.itemId).toBe('PROD-001');
      expect(summary.minDiff?.itemId).toBe('PROD-002');
    });

    it('debe marcar requiresRecount cuando |diff%| > 10%', () => {
      const differences: CountingDifference[] = [
        {
          itemId: 'PROD-001',
          name: 'Product A',
          theoretical: 100,
          counted: 88,
          diff: -12,
          diffPercent: -12,
          requiresRecount: true,
        },
        {
          itemId: 'PROD-002',
          name: 'Product B',
          theoretical: 100,
          counted: 95,
          diff: -5,
          diffPercent: -5,
          requiresRecount: false,
        },
      ];

      const summary = supervisorService.calculateSummary(differences);

      expect(summary.itemsRequiringRecount).toBe(1);
    });
  });

  describe('getStatistics', () => {
    it('debe retornar estadísticas por defecto', async () => {
      const stats = await supervisorService.getStatistics();

      expect(stats).toEqual({
        totalSessions: 0,
        openSessions: 0,
        closedSessions: 0,
        approvedSessions: 0,
        avgItemsPerSession: 0,
        avgDiffPercent: 0,
      });
    });
  });
});
