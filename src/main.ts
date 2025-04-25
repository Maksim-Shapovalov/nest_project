import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSettings } from './app.settings';

const serverUrl = 'http://localhost:3000';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSettings(app);
  console.log(3000);
  await app.listen(3000);
}
bootstrap();
