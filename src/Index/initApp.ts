import express from 'express';
import cookieParser from 'cookie-parser';
import { VideoRouter } from '../Videos/video-router';
import { AllDataClear } from '../all-data-clear';
import { blogsRouter } from '../Blogs/Blogs.router';
import { postsRouter } from '../Posts/Posts.router';
import { userRouter } from '../Users/User.router';
import { authRouter } from '../Authentication/Auth.router';
import { commentsRouter } from '../Comment/Comments.router';
import { securityDevicesRouter } from '../Device/SecurityDevices.router';

export const app = express();

app.set('trust proxy', true);
app.use(express.json());
app.use(cookieParser());

app.use('/videos', VideoRouter);
app.use('/testing/all-data', AllDataClear);
app.use('/blogs', blogsRouter);
app.use('/posts', postsRouter);
app.use('/users', userRouter);
app.use('/auth', authRouter);
app.use('/comments', commentsRouter);
app.use('/security/devices', securityDevicesRouter);
// app.use('/AllDataVideoClear', AllDataVideoClear);
