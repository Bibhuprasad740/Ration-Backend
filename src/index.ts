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

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

async function start() {
  const mongoUrl = process.env.MONGODB_URL;
  if (!mongoUrl) {
    throw new Error('MONGODB_URL is not set in environment');
  }

  await mongoose.connect(mongoUrl);
  console.log('Connected to MongoDB');

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});
