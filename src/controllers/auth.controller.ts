import { Request, RequestHandler, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { logger } from '../utils/logger';
import { assignStarterPokemons } from '../helpers/pokemon.helper';

export const register: RequestHandler = async (req, res) => {
  try {
    const pokemonCount = Number(process.env.STARTER_POKEMON_COUNT) || 3;
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const pokemons = await assignStarterPokemons(pokemonCount);

    const newUser = await User.create({ username, email, password: hashedPassword, pokemons });
    res.status(201).json({ message: 'User registered', user: newUser });
  } catch (error) {
    logger.error('Register error', error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '1d' });
    res.json({ token });
  } catch (error) {
    logger.error('Login error', error);
    res.status(500).json({ message: 'Login failed' });
  }
};
