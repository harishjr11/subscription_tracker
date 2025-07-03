import { config } from 'dotenv';

// Load correct environment file (e.g., .env.production.local or .env.development.local)
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Only use hardcoded port in dev; rely on process.env.PORT in production
const PORT = NODE_ENV === 'development' ? 5500 : process.env.PORT || 5000;

export const {
  DB_URI,
  SERVER_URL,
  JWT_SECRET,
  JWT_EXPIRE,
  ARCJET_ENV,
  ARCJET_API_KEY,
  QSTASH_URL,
  QSTASH_TOKEN,
} = process.env;

export { NODE_ENV, PORT };
