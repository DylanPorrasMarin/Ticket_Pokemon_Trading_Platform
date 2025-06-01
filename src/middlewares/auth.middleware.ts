// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction,RequestHandler  } from 'express';
import jwt from 'jsonwebtoken';
import { UserTokenPayload } from '../types/global';


export const authenticate: RequestHandler = (req, res, next): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserTokenPayload;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
