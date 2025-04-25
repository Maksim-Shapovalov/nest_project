import { Module } from '@nestjs/common';
import { CryptoService } from './crypro.service';

@Module({
  providers: [CryptoService],
  exports: [CryptoService],
})
export class CryptoModule {}
