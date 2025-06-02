import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { registerUser, loginUser } from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const user = await registerUser(username, email, password);
    res.status(201).json({ message: 'User registered', user });
  } catch (error) {
    logger.error('Register error', error);
    let message = 'Registration failed';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      message = (error as { message: string }).message;
    }
    const status = message === 'User already exists' || message === 'Invalid email format' ? 400 : 500;
    res.status(status).json({ message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const token = await loginUser(email, password);
    res.json({ token });
  } catch (error) {
    logger.error('Login error', error);
    let message = 'Login failed';
    if (typeof error === 'object' && error !== null && 'message' in error) {
      message = (error as { message: string }).message;
    }
    const status = message === 'User not found' || message === 'Invalid credentials' ? 401 : 500;
    res.status(status).json({ message });
  }
};
