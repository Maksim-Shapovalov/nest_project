import mongoose from 'mongoose';
import { BlackListForTokenType } from './blackListForToken-type';

const blackListSchemas = new mongoose.Schema<BlackListForTokenType>({
  token: { type: String, required: true },
});

export const BlackListModel = mongoose.model('blackList', blackListSchemas);
