import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import { PostsType } from '../types/posts-type';
import { BlogsType } from '../types/blogs-type';
import { UserMongoDbType } from '../types/user-type';
import { CommentsTypeDb } from '../types/comment-type';
import { BlackListForTokenType } from '../types/blackListForToken-type';
import { DevicesUserDB } from '../types/device-of-user';
import { neSytTypes } from '../types/neSyt-types';
import mongoose, { mongo } from 'mongoose';
config();

const url = process.env.MONGO_URL || 'mongodb://localhost:27017';
const dbName = process.env.MONGO_URL || 'duplicate-code';
if (!url) {
  throw new Error('Url doesnt found');
}
const client = new MongoClient(url);
const db = client.db('duplicate-code');

// export const dataBlog = db.collection<BlogsType>("blogs")
// export const dataPost = db.collection<PostsType>("posts")
// export const dataUser = db.collection<UserDbType>("user")
// export const dataComments = db.collection<CommentsTypeDb>("comments")
// export const dataBlackListForToken = db.collection<BlackListForTokenType>("blackList")
// export const dataID = db.collection<DevicesUserDB>('info')
// export const neSyt = db.collection<neSytTypes>('neSyt')

export const runDB = async () => {
  try {
    // await client.connect()
    await mongoose.connect(url);
    console.log('Connected successfully to server');
  } catch {
    await mongoose.disconnect();
    // await client.close()
  }
};
