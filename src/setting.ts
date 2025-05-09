import dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();
export const setting = {
  JWT_SECRET: process.env.JWT_SECRET || '123',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || '321',
  Username: process.env.HTTP_BASIC_USER || 'admin',
  Password: process.env.HTTP_BASIC_PASS || 'qwerty',
};
