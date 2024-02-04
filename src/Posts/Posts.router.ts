import { Router } from 'express';
import { PostsValidation } from './validation/Posts.validation';
import { ErrorMiddleware } from '../ErrorInfo/error-middleware';

import {
  authMiddleware,
  authMiddlewareForGetCommentById,
} from '../Authentication/Validation/Auth.middleware';
import {
  CommentValidation,
  LikeStatusValidation,
} from '../Comment/Validation/Comment.validation';

import { PostsController } from './Posts.controller';
import { container } from '../composition-root/composition-root';

export const postsRouter = Router();

const postsController = container.resolve<PostsController>(PostsController);

postsRouter.get(
  '/',
  authMiddlewareForGetCommentById,
  postsController.getAllPostsInDB.bind(postsController),
);
postsRouter.get(
  '/:id',
  authMiddlewareForGetCommentById,
  postsController.getPostByPostId.bind(postsController),
);
postsRouter.get(
  '/:postId/comments',
  authMiddlewareForGetCommentById,
  postsController.getCommentByCommendIdInPosts.bind(postsController),
);
postsRouter.post(
  '/:postId/comments',
  authMiddlewareForGetCommentById,
  CommentValidation(),
  ErrorMiddleware,
  postsController.createCommentsInPostById.bind(postsController),
);
postsRouter.post(
  '/',
  authMiddlewareForGetCommentById,
  PostsValidation(),
  ErrorMiddleware,
  postsController.createNewPost.bind(postsController),
);
postsRouter.put(
  '/:id',
  authMiddleware,
  PostsValidation(),
  ErrorMiddleware,
  postsController.updatePostByPostId.bind(postsController),
);
postsRouter.put(
  '/:postId/like-status',
  authMiddleware,
  LikeStatusValidation(),
  ErrorMiddleware,
  postsController.appropriationLike.bind(postsController),
);
postsRouter.delete(
  '/:id',
  authMiddleware,
  postsController.deletePostByPostId.bind(postsController),
);
