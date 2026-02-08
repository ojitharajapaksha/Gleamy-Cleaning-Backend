import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import serviceRoutes from './routes/service.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import employeeRoutes from './routes/employee.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { initializeFirebase } from './config/firebase.config.js';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin SDK
initializeFirebase();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// ============================================
// Middleware
// ============================================

// CORS configuration - supports multiple origins separated by comma
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'GLEAMY API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// ============================================
// API Routes
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/employees', employeeRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Global error handler
app.use(errorHandler);

// ============================================
// Server Initialization
// ============================================

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🌟 GLEAMY CLEANING SERVICES API 🌟                  ║
║                                                        ║
║   Server running on: http://localhost:${PORT}         ║
║   Environment: ${process.env.NODE_ENV}                ║
║   Database: MongoDB                                    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);
  });
};

startServer();

export default app;
