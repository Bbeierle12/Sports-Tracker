import express from 'express';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import apiRoutes from './routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(corsMiddleware);

app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });
  next();
});

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({
    name: 'Sports Stats API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      games: '/api/games',
      standings: '/api/standings',
      teams: '/api/teams',
      players: '/api/players/:playerId',
    },
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`
  ========================================
  Sports Stats API Server
  ========================================
  Port: ${PORT}
  CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}

  Endpoints:
  - GET /api/health
  - GET /api/games
  - GET /api/games/:gameId
  - GET /api/standings
  - GET /api/teams
  - GET /api/teams/:teamId
  - GET /api/players/:playerId
  ========================================
  `);
});
