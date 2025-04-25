import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  async createHash(
    password: string,
    saltOrRounds: string | number,
  ): Promise<string> {
    return bcrypt.hash(password, saltOrRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async genSalt(round: number): Promise<string> {
    return bcrypt.genSalt(round);
  }
}
