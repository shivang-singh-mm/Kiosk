import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './core/config';
import { swaggerSpec } from './core/config/swagger';

export const app: Express = express();
export const PORT = config.port;

app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());

/**
 * @openapi
 * /ping:
 *   get:
 *     summary: Keep-alive health check
 *     description: Returns application status, uptime pong message, and timestamp.
 *     tags:
 *       - Health Check
 *     responses:
 *       200:
 *         description: Server is healthy and responsive
 */
app.get(['/', '/ping', '/api/ping'], (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    message: 'pong',
    app: 'Aura Realty Kiosk Pro (Node.js + PostgreSQL)',
    timestamp: new Date().toISOString(),
  });
});

// Swagger OpenAPI documentation UI route
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
