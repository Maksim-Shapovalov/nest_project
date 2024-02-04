import { Request, Response, Router } from 'express';
import { DataIDModelClass } from './Device/DataId.schemas';

import { BlogModelClass } from './Blogs/Type/Blogs.schemas';
import {
  PostLikesModelClass,
  PostModelClass,
} from './Posts/Type/Posts.schemas';
import { CommentsModelClass } from './Comment/Type/Comments.schemas';
import { HTTP_STATUS } from './Index';

export const AllDataClear = Router();
// @Controller('testing/all-data');
AllDataClear.delete('/', async (req: Request, res: Response) => {
  await Promise.all([
    PostModelClass.deleteMany({}),
    BlogModelClass.deleteMany({}),
    UserModelClass.deleteMany({}),
    CommentsModelClass.deleteMany({}),
    DataIDModelClass.deleteMany({}),
    PostLikesModelClass.deleteMany({}),
  ]);
  return res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
});
