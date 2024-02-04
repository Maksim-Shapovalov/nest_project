import { Router } from 'express';
import { authGuardMiddleware } from '../Authentication/Validation/register-middleware';
import { BlogsValidation } from './validation/Blogs.validation';
import { ErrorMiddleware } from '../ErrorInfo/error-middleware';
import { PostspParamsValidation } from '../qurey-repo/query-posts-repository';
import { container } from '../composition-root/composition-root';
import { BlogsController } from './Blogs.controller';
import {
  authMiddleware,
  authMiddlewareForGetCommentById,
} from '../Authentication/Validation/Auth.middleware';

export const blogsRouter = Router();

const blogController = container.resolve<BlogsController>(BlogsController);

blogsRouter.get('/', blogController.getAllBlogs.bind(blogController));
blogsRouter.get('/:id', blogController.getBlogById.bind(blogController));
blogsRouter.get(
  '/:id/posts',
  authMiddlewareForGetCommentById,
  blogController.getPostsByBlogId.bind(blogController),
);
blogsRouter.post(
  '/:blogId/posts',
  authMiddlewareForGetCommentById,
  PostspParamsValidation(),
  ErrorMiddleware,
  blogController.createPostInBlogByBlogId.bind(blogController),
);
blogsRouter.post(
  '/',
  authMiddlewareForGetCommentById,
  BlogsValidation(),
  ErrorMiddleware,
  blogController.createNewBlog.bind(blogController),
);
blogsRouter.put(
  '/:id',
  authGuardMiddleware,
  BlogsValidation(),
  ErrorMiddleware,
  blogController.updateBlogByBlogId.bind(blogController),
);
blogsRouter.delete(
  '/:id',
  authGuardMiddleware,
  blogController.deleteBlogById.bind(blogController),
);
