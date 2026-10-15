import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/auth';
import speciesRoutes from './routes/species';
import sightingsRoutes from './routes/sightings';
import usersRoutes from './routes/users';
import challengesRoutes from './routes/challenges';
import adminRoutes from './routes/admin';

const app = express();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Serve uploaded photos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/sightings', sightingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/challenges', challengesRoutes);
app.use('/api/admin', adminRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled API Error:', err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

export default app;
