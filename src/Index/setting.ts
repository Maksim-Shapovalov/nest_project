import dotenv from 'dotenv';

dotenv.config();
export const setting = {
  MONGO_URI: process.env.MONGO_URL || 'mongodb://localhost:27017',
  JWT_SECRET: process.env.JWT_SECRET || '123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '321',
};
