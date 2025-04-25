import { Trim } from '../../../../core/decorators/trim-validator';
import { Length } from 'class-validator';

export class BanUserDto {
  isBanned: boolean;
  @Length(1, 500)
  @Trim()
  banReason: string;
}
