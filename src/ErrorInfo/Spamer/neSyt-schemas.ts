import mongoose from 'mongoose';

const neSytSchemas = new mongoose.Schema({
  ip: { type: String, required: true },
  way: { type: String, required: true },
  createdAt: { type: String, required: true },
});

export const NeSytModelClass = mongoose.model('neSyt', neSytSchemas);
