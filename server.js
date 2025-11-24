<<<<<<< HEAD
import './src/server.js';
=======
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { createApp } from './src/app.js';

dotenv.config();

async function bootstrap() {
  try {
    await connectDB();

    const app = createApp();

    const PORT = env.PORT;
    app.listen(PORT, () => {
      console.log(`Backend running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start backend server:', error);
    process.exit(1);
  }
}

bootstrap();
>>>>>>> bc8cd09 (Auto-fix backend + update API + CORS + Git config)
