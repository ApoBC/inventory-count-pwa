import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { DifferenceService, type Difference } from './DifferenceService.js';
import { ERP_GATEWAY_URL, logger } from '../config.js';

export interface CreateSessionRequest {
  warehouse: string;
  location?: string;
  operatorId: string;
}

export interface CountBatch {
  clientId: string;
  itemId: string;
  qty: number;
}

export interface ApprovalRequest {
  supervisorId: string;
  adjustments?: Array<{ itemId: string; diff: number }>;
}

export class CountingService {
  private differenceService = new DifferenceService();

  constructor(private prisma: PrismaClient) {}

  /**
   * Crear nueva sesión de conteo
   */
  async createSession(req: CreateSessionRequest) {
    try {
      const session = await this.prisma.countingSession.create({
        data: {
          warehouse: req.warehouse,
          location: req.location,
          operatorId: req.operatorId,
          status: 'OPEN',
        },
      });

      logger.info(
        { sessionId: session.id, warehouse: req.warehouse, operatorId: req.operatorId },
        'Counting session created'
      );

      return session;
    } catch (error) {
      logger.error(error, 'Create session failed');
      throw error;
    }
  }

  /**
   * Obtener sesión por ID
   */
  async getSession(sessionId: string) {
    const session = await this.prisma.countingSession.findUnique({
      where: { id: sessionId },
      include: {
        counts: {
          select: {
            clientId: true,
            itemId: true,
            qty: true,
            synced: true,
          },
        },
      },
    });

    return session;
  }

  /**
   * Guardar conteos en lote (CRÍTICO: implementa idempotencia)
   *
   * Usa upsert con key (sessionId, clientId, itemId) para garantizar
   * que conteos duplicados no se procesen dos veces.
   */
  async saveCounts(sessionId: string, counts: CountBatch[]) {
    try {
      const results = {
        accepted: [] as Array<{ clientId: string; countId: string }>,
        errors: [] as Array<{ clientId: string; error: string }>,
      };

      // Verificar que sesión existe y está abierta
      const session = await this.prisma.countingSession.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        throw new Error('Session not found');
      }

      if (session.status !== 'OPEN') {
        throw new Error(`Session is ${session.status}, cannot add counts`);
      }

      // Procesar cada conteo con upsert (idempotencia)
      for (const count of counts) {
        try {
          const result = await this.prisma.count.upsert({
            // La clave única garantiza idempotencia
            where: {
              sessionId_clientId_itemId: {
                sessionId,
                clientId: count.clientId,
                itemId: count.itemId,
              },
            },
            // Si no existe, crear
            create: {
              sessionId,
              clientId: count.clientId,
              itemId: count.itemId,
              qty: count.qty,
              synced: false,
            },
            // Si existe, actualizar (por si cambió la cantidad)
            update: {
              qty: count.qty,
              synced: false,
            },
          });

          results.accepted.push({
            clientId: count.clientId,
            countId: result.id,
          });

          logger.debug(
            { sessionId, clientId: count.clientId, itemId: count.itemId, qty: count.qty },
            'Count saved (upserted)'
          );
        } catch (error) {
          results.errors.push({
            clientId: count.clientId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });

          logger.warn(
            { sessionId, clientId: count.clientId, error },
            'Failed to save count'
          );
        }
      }

      logger.info(
        { sessionId, accepted: results.accepted.length, errors: results.errors.length },
        'Batch counts saved'
      );

      return results;
    } catch (error) {
      logger.error(error, 'Save counts failed');
      throw error;
    }
  }

  /**
   * Calcular diferencias para sesión
   */
  async getDifferences(sessionId: string): Promise<Difference[]> {
    try {
      // Obtener todos los conteos de la sesión
      const counts = await this.prisma.count.findMany({
        where: { sessionId },
        select: { itemId: true, qty: true },
      });

      if (counts.length === 0) {
        return [];
      }

      // Agrupar por itemId (sumar si hay múltiples conteos del mismo ítem)
      const countsByItem = new Map<string, number>();
      for (const count of counts) {
        const current = countsByItem.get(count.itemId) || 0;
        countsByItem.set(count.itemId, current + count.qty);
      }

      // Calcular diferencias
      const differences = await this.differenceService.calculateDifferences(sessionId, countsByItem);

      logger.info(
        { sessionId, itemsCount: differences.length },
        'Differences calculated'
      );

      return differences;
    } catch (error) {
      logger.error(error, 'Get differences failed');
      throw error;
    }
  }

  /**
   * Supervisor aprueba sesión y crea diario en ERP
   */
  async approveCounting(sessionId: string, req: ApprovalRequest) {
    const tx = await this.prisma.$transaction(async tx => {
      try {
        // 1. Verificar sesión
        const session = await tx.countingSession.findUnique({
          where: { id: sessionId },
          include: { counts: true },
        });

        if (!session) {
          throw new Error('Session not found');
        }

        if (session.status === 'APPROVED') {
          throw new Error('Session already approved');
        }

        // 2. Calcular diferencias (si no se proporcionan ajustes)
        let differences = await this.differenceService.calculateDifferences(
          sessionId,
          new Map(session.counts.map(c => [c.itemId, c.qty]))
        );

        // 3. Aplicar ajustes manuales si se proporcionan
        if (req.adjustments && req.adjustments.length > 0) {
          const adjustmentMap = new Map(req.adjustments.map(a => [a.itemId, a.diff]));
          differences = differences.map(d => ({
            ...d,
            diff: adjustmentMap.has(d.itemId) ? adjustmentMap.get(d.itemId)! : d.diff,
            diffPercent: adjustmentMap.has(d.itemId)
              ? ((adjustmentMap.get(d.itemId)! / d.theoretical) * 100)
              : d.diffPercent,
          }));
        }

        // 4. Crear diario de inventario
        const journalLines = this.differenceService.getItemsWithDifference(differences);

        if (journalLines.length === 0) {
          logger.info({ sessionId }, 'No differences, skipping journal creation');
        }

        // 5. Enviar a ERP Gateway
        if (journalLines.length > 0) {
          const erpResponse = await axios.post(`${ERP_GATEWAY_URL}/inventory-journals`, {
            lines: journalLines.map(d => ({
              itemId: d.itemId,
              diff: d.diff,
            })),
          });

          logger.info(
            { sessionId, erpJournalId: erpResponse.data.journalId },
            'Journal sent to ERP'
          );

          // 6. Guardar diario localmente
          await tx.inventoryJournal.create({
            data: {
              sessionId,
              erpJournalId: erpResponse.data.journalId,
              status: 'POSTED',
              postedAt: new Date(),
              lines: {
                create: journalLines.map(d => ({
                  itemId: d.itemId,
                  diff: d.diff,
                })),
              },
            },
          });
        }

        // 7. Actualizar sesión
        const approvedSession = await tx.countingSession.update({
          where: { id: sessionId },
          data: {
            status: 'APPROVED',
            approvedAt: new Date(),
            supervisorId: req.supervisorId,
          },
        });

        logger.info(
          { sessionId, supervisorId: req.supervisorId, itemsCount: journalLines.length },
          'Counting approved and journal posted'
        );

        return {
          success: true,
          sessionId,
          journalId: (await tx.inventoryJournal.findUnique({
            where: { sessionId },
          }))?.id,
          itemsAdjusted: journalLines.length,
          postedAt: new Date().toISOString(),
        };
      } catch (error) {
        logger.error(error, 'Approval failed');
        throw error;
      }
    });

    return tx;
  }

  /**
   * Obtener logs de sincronización (para debugging)
   */
  async getCountsBySession(sessionId: string) {
    return this.prisma.count.findMany({
      where: { sessionId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
