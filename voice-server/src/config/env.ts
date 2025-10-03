import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

interface Config {
  openai: {
    apiKey: string;
  };
  server: {
    port: number;
    allowedOrigins: string[];
  };
}

const config: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(','),
  },
};

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error(`❌ Missing required environment variable: OPENAI_API_KEY`);
  process.exit(1);
}

export default config;
