import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import productsRouter from './routes/products';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', productsRouter);

// MongoDB connection with connection reuse for serverless
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL is not set in environment');
  }

  try {
    await mongoose.connect(mongoUrl, {
      bufferCommands: false, // Disable mongoose buffering
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  async function start() {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  }

  start().catch((err) => {
    console.error('Failed to start server', err);
    process.exit(1);
  });
}

// Export for Vercel
export default app;