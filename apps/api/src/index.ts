import express from 'express';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { corsMiddleware } from './middleware/cors';
import apiRoutes from './routes';
import { webSocketService } from './services/websocket';

dotenv.config();

const app = express();
const server = createServer(app);
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
    name: 'NHL Dashboard API',
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

// Initialize WebSocket server
webSocketService.initialize(server);

server.listen(PORT, () => {
  console.log(`
  ========================================
  Sports Tracker API Server
  ========================================
  Port: ${PORT}
  CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
  WebSocket: ws://localhost:${PORT}/ws

  REST Endpoints:
  - GET /api/health
  - GET /api/games
  - GET /api/games/:gameId
  - GET /api/standings
  - GET /api/teams
  - GET /api/teams/:teamId
  - GET /api/players/:playerId
  - GET /api/sports
  - POST /api/sports/batch/live

  WebSocket Events:
  - score_update
  - game_state_change
  - live_sports_update
  ========================================
  `);
});
