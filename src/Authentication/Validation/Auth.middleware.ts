// import { NextFunction, Request, Response } from 'express';
// import { body } from 'express-validator';
// import { UserRepository } from '../../Users/User.repository';
// import { JwtService } from '../../Token/jwt-service';
//
// export const userRepo = container.resolve<UserRepository>(UserRepository);
// const jwtService = container.resolve<JwtService>(JwtService);
//
// export const authMiddlewareForGetCommentById = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const registr = req.headers.authorization;
//   if (!registr) {
//     return next();
//   }
//   const token = registr.split(' ')[1];
//
//   const userId = await jwtService.getUserIdByToken(token);
//   if (userId) {
//     const user = await userRepo.getUserById(userId);
//
//     if (user) {
//       req.body.user = user;
//       return next();
//     }
//   }
//
//   return next();
// };
//
// export const authMiddleware = async (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) => {
//   const registr = req.headers.authorization;
//   if (!registr) {
//     return res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
//   }
//
//   const token = registr.split(' ')[1];
//
//   const userId = await jwtService.getUserIdByToken(token);
//
//   if (userId) {
//     const user = await userRepo.getUserById(userId);
//
//     if (user) {
//       req.body.user = await userRepo.getUserById(userId);
//       return next();
//     }
//   }
//
//   res.sendStatus(HTTP_STATUS.UNAUTHORIZED_401);
// };
//
// export const CheckingAuthorizationValidationCode = () => [
//   body('code').custom(async (value) => {
//     const codeUsers = await userRepo.findUserByRecoveryCode(value);
//     if (!codeUsers) throw new Error('user not found');
//     if (codeUsers.emailConfirmation.isConfirmed === true)
//       throw new Error('user is registered');
//     if (codeUsers.emailConfirmation.expirationDate < new Date().toISOString())
//       throw new Error('date');
//     if (codeUsers.emailConfirmation.confirmationCode !== value)
//       throw new Error('user not found');
//
//     return true;
//   }),
// ];
