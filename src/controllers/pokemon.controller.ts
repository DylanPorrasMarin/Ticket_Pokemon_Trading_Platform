import { Request, Response } from 'express';
import { getAllUsersWithPokemons, getUserPokemons } from '../services/pokemon.service';

export const getMyPokemons = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const pokemons = await getUserPokemons(userId);
    res.json({ pokemons });
  } catch (error) {
    console.error('Error getting own pokemons:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ message });
  }
};

export async function getPokemonsByUserId(req: Request, res: Response) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const pokemons = await getUserPokemons(userId);
        res.json({ pokemons });
    } catch (error) {
        console.error('Error getting user pokemons:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(404).json({ message });
    }
}

export const getAllUsersAndPokemons = async (req: Request, res: Response) => {
  try {
    const users = await getAllUsersWithPokemons();
    res.json({ users });
  } catch (error) {
    console.error('Error getting all users and pokemons:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};