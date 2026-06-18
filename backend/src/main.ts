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
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.1.153:3001',

      // Vercel domains
      'https://tbm-signup.vercel.app',
      'https://tbm-admin.vercel.app',

      // Production custom domains
      'https://signup.thebutterflymovement.health',
      'https://admin.thebutterflymovement.health',

      // Main website (if it ever calls the API)
      'https://www.thebutterflymovement.health',
      'https://thebutterflymovement.health',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port);
}
bootstrap();