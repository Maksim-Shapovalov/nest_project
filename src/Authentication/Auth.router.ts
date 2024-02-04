import { Router } from 'express';
import {
  AuthBodyToSendNewPassword,
  AuthValidation,
  AuthValidationEmail,
  AuthValidationEmailToSendMessage,
} from './Validation/Auth.validation';
import { ErrorMiddleware } from '../ErrorInfo/error-middleware';
import {
  IPRequestCounter,
  ValidationRefreshToken,
} from '../Token/token-middleware';
import {
  authMiddleware,
  CheckingAuthorizationValidationCode,
} from './Validation/Auth.middleware';
import { container } from '../composition-root/composition-root';
import { AuthController } from './Auth.controller';

export const authRouter = Router();

const authController = container.resolve<AuthController>(AuthController);

authRouter.post(
  '/login',
  IPRequestCounter,
  authController.loginInApp.bind(authController),
);

authRouter.post(
  '/password-recovery',
  AuthValidationEmailToSendMessage(),
  IPRequestCounter,
  ErrorMiddleware,
  authController.passwordRecovery.bind(authController),
);

authRouter.post(
  '/new-password',
  AuthBodyToSendNewPassword(),
  IPRequestCounter,
  ErrorMiddleware,
  authController.createdNewPasswordForUserby.bind(authController),
);

authRouter.post(
  '/refresh-token',
  ValidationRefreshToken,
  IPRequestCounter,
  authController.refreshToken.bind(authController),
);

authRouter.post(
  '/logout',
  ValidationRefreshToken,
  authController.logoutInApp.bind(authController),
);

authRouter.post(
  '/registration-confirmation',
  IPRequestCounter,
  CheckingAuthorizationValidationCode(),
  ErrorMiddleware,
  authController.registrationConfirmation.bind(authController),
);

authRouter.post(
  '/registration',
  IPRequestCounter,
  AuthValidation(),
  ErrorMiddleware,
  authController.registrationInApp.bind(authController),
);

authRouter.post(
  '/registration-email-resending',
  IPRequestCounter,
  AuthValidationEmail(),
  ErrorMiddleware,
  authController.registrationEmailResending.bind(authController),
);

authRouter.get('/me', authMiddleware, authController.me.bind(authController));
