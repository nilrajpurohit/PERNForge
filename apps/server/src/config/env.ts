import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: envPath });

export const config = {
  DATABASE_URL: process.env.DATABASE_URL ?? process.env.DB_URL ?? 'postgresql://admin:strongpassword@localhost:5432/appdb',
  REDIS_URL: process.env.REDIS_URL ?? 'redis://localhost:6379',
  JWT_SECRET: process.env.JWT_SECRET ?? 'supersecretjwtkey',
  PORT: process.env.PORT ?? process.env.SERVER_PORT ?? '4000',
  NODE_ENV: process.env.NODE_ENV ?? 'development'
};
