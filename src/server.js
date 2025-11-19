import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { logger } from './lib/logger.js';
import { requestLogging, rateLimiter, securityHeaders } from './middleware/security.js';
import { errorHandler } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import postsRoutes from './routes/posts.js';
import schedulesRoutes from './routes/schedules.js';

const app = express();

app.use(cors(config.cors));
app.use(express.json());
app.use(securityHeaders);
app.use(requestLogging);
app.use(rateLimiter(15 * 60 * 1000, 100));

app.get('/', (req, res) => {
  res.json({
    message: 'PostAI Backend API',
    status: 'running',
    version: '2.0.0',
    endpoints: {
      auth: '/auth',
      posts: '/posts',
      schedules: '/schedules'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/posts', postsRoutes);
app.use('/schedules', schedulesRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Backend running on port ${PORT}`, {
    environment: config.nodeEnv,
    version: '2.0.0'
  });
});

export default app;
