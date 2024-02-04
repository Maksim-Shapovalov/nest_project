import { Router } from 'express';
import {
  authMiddleware,
  authMiddlewareForGetCommentById,
} from '../Authentication/Validation/Auth.middleware';
import {
  CommentValidation,
  LikeStatusValidation,
} from './Validation/Comment.validation';
import { ErrorMiddleware } from '../ErrorInfo/error-middleware';
import { container } from '../composition-root/composition-root';
import { CommentsController } from './Comment.controller';

export const commentsRouter = Router();

const commentsController =
  container.resolve<CommentsController>(CommentsController);

commentsRouter.get(
  '/:id',
  authMiddlewareForGetCommentById,
  commentsController.getCommentsById.bind(commentsController),
);
commentsRouter.put(
  '/:commentId',
  authMiddleware,
  CommentValidation(),
  ErrorMiddleware,
  commentsController.updateCommentByCommentId.bind(commentsController),
);
commentsRouter.put(
  '/:commentId/like-status',
  authMiddleware,
  LikeStatusValidation(),
  ErrorMiddleware,
  commentsController.appropriationLike.bind(commentsController),
);
commentsRouter.delete(
  '/:commentId',
  authMiddleware,
  commentsController.deleteCommentByCommentId.bind(commentsController),
);
