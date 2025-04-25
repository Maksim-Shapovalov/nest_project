import { Global, Module } from '@nestjs/common';
import {
  ConfigModule as NestConfigModule,
  ConfigService,
} from '@nestjs/config';
import { JwtConfig } from './JwtConfig';

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      envFilePath: [
        process.env.ENV_FILE_PATH?.trim() || '',
        `.env.${process.env.ENV_TYPE}.local`,
        `.env.${process.env.ENV_TYPE}`,
        '.env.production',
      ],
      isGlobal: true,
    }),
  ],
  providers: [
    {
      provide: JwtConfig,
      useFactory: (configService: ConfigService<any, true>) =>
        new JwtConfig(configService),
      inject: [ConfigService],
    },
  ],
  exports: [JwtConfig],
})
export class ConfigModule {}
