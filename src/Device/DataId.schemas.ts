import mongoose from 'mongoose';

const dataIdSchemas = new mongoose.Schema({
  ip: { type: String, required: true },
  title: { type: String, required: true },
  lastActiveDate: { type: String, required: true },
  deviceId: { type: String, required: true },
  userId: { type: String, required: true },
});

export const DataIDModelClass = mongoose.model('info', dataIdSchemas);
