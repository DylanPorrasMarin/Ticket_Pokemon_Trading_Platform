// src/routes/ranking.routes.ts
import { Router } from 'express';
import { listRanking } from '../controllers/ranking.controller';

const router = Router();

/**
 * @swagger
 * /api/ranking:
 *   get:
 *     summary: Get user rankings based on successful trades
 *     tags: [Ranking]
 *     responses:
 *       200:
 *         description: List of user rankings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   successfulTrades:
 *                     type: number
 */
router.get('/', listRanking);

export default router;
