import { Router } from 'express';
import { UserValidation } from './Validation/user-validation';
import { authGuardMiddleware } from '../Authentication/Validation/register-middleware';
import { ErrorMiddleware } from '../ErrorInfo/error-middleware';
import { container } from '../composition-root/composition-root';
import { UserController } from './User.controller';

export const userRouter = Router();

const userController = container.resolve<UserController>(UserController);

userRouter.get(
  '/',
  authGuardMiddleware,
  userController.getAllUserInDB.bind(userController),
);
userRouter.get(
  '/:codeId',
  userController.getUserByCodeIdInDB.bind(userController),
);
userRouter.post(
  '/',
  authGuardMiddleware,
  UserValidation(),
  ErrorMiddleware,
  userController.createNewUser.bind(userController),
);
userRouter.delete(
  '/:id',
  authGuardMiddleware,
  userController.deleteUserInDB.bind(userController),
);
