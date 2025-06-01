// src/routes/trade.routes.ts
import { Router } from 'express';
import {
  requestTrade,
  getReceivedTrades,
  acceptTrade,
  rejectTrade
} from '../controllers/trade.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

import { Request, Response, NextFunction, RequestHandler } from 'express';

const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };


/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: Pokémon trade operations
 */

/**
 * @swagger
 * /trades/request:
 *   post:
 *     summary: Request a Pokémon trade
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiver:
 *                 type: string
 *               senderPokemon:
 *                 type: number
 *               receiverPokemon:
 *                 type: number
 *     responses:
 *       201:
 *         description: Trade request sent
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/request', authenticate, asyncHandler(requestTrade));

/**
 * @swagger
 * /trades/received:
 *   get:
 *     summary: Get received trade requests
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of received trade requests
 *       401:
 *         description: Unauthorized
 */
router.get('/received', authenticate, asyncHandler(getReceivedTrades));

/**
 * @swagger
 * /trades/{id}/accept:
 *   post:
 *     summary: Accept a trade request
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Trade ID
 *     responses:
 *       200:
 *         description: Trade accepted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trade not found
 *       500:
 *         description: Server error
 */
router.post('/:id/accept', authenticate, asyncHandler(acceptTrade));

/**
 * @swagger
 * /trades/{id}/reject:
 *   post:
 *     summary: Reject a trade request
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: Trade ID
 *     responses:
 *       200:
 *         description: Trade rejected
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Trade not found
 *       500:
 *         description: Server error
 */
router.post('/:id/reject', authenticate, asyncHandler(rejectTrade));

export default router;
