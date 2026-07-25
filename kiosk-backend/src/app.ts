import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { config } from './core/config';

export const app: Express = express();
export const PORT = config.port;

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    app: 'Aura Realty Kiosk Pro (Node.js + PostgreSQL)',
    version: '1.0.0',
  });
});
