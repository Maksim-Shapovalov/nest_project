import { BlogsType } from './Blogs.type';
import mongoose from 'mongoose';

const blogsSchemas = new mongoose.Schema<BlogsType>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  websiteUrl: { type: String, required: true },
  createdAt: { type: String, required: true },
  isMembership: { type: Boolean, required: true },
});
export const BlogModelClass = mongoose.model('blogs', blogsSchemas);
