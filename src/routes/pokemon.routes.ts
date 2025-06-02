import { Router, Request, Response, NextFunction } from 'express';
import { getAllUsersAndPokemons, getMyPokemons, getPokemonsByUserId } from '../controllers/pokemon.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { asyncHandler } from '../helpers/handler.helper'

const router = Router();

/**
 * @swagger
 * /pokemon/my:
 *   get:
 *     summary: Get the authenticated user's Pokémon
 *     tags: [Pokemon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's Pokémon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pokemons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/my', authenticate, getMyPokemons);

/**
 * @swagger
 * /pokemon/user/{userId}:
 *   get:
 *     summary: Get Pokémon by user ID
 *     tags: [Pokemon]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID
 *     responses:
 *       200:
 *         description: List of the user's Pokémon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pokemons:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       level:
 *                         type: number
 *       404:
 *         description: User not found
 */
router.get('/user/:userId', asyncHandler(getPokemonsByUserId));


/**
 * @swagger
 * /pokemon/all:
 *   get:
 *     summary: Get all users with their Pokémon
 *     tags: [Pokemon]
 *     responses:
 *       200:
 *         description: List of users and their Pokémon
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       username:
 *                         type: string
 *                       pokemons:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                             name:
 *                               type: string
 *                             level:
 *                               type: number
 */
router.get('/all', asyncHandler(getAllUsersAndPokemons));

export default router;
