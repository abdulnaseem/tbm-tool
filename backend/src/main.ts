// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  // CORS for Next.js
  app.enableCors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.0.46:3001'],
    credentials: true,
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();