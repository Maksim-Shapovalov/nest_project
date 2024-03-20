import {
  Length,
  Matches,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { FindUserByRecoveryCode } from '../../Users/Type/User.type';
import { UserRepository } from '../../Users/User.repository';

export class bodyUserForRegistration {
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;
  @Length(6, 20)
  password: string;
  email: string;
}

// @ValidatorConstraint({ name: 'email', async: true })
// @Injectable()
// export class CustomEmailvalidation implements ValidatorConstraintInterface {
//   constructor(protected userRepository: UserRepository) {}
//
//   async validate(value: string) {
//     const findUser: FindUserByRecoveryCode =
//       await this.userRepository.findByLoginOrEmail(value);
//     if (!findUser) {
//       throw new BadRequestException({
//         message: 'email is not exist',
//         field: 'email',
//       });
//     }
//     return true;
//   }
// }
// export class registrationEmailDTO {
//   @Validate(CustomEmailvalidation)
//   email: string;
// }
