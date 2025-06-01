import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

export const loadMiddlewares = (app: express.Application) => {
  app.use(express.json());
  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
};
