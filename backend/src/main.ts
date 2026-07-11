// backend/src/main.ts
import { NestFactory } from '@nestjs/core';
import {
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.1.153:3001',
    'https://tbm-signup.vercel.app',
    'https://tbm-admin.vercel.app',
    'https://signup.thebutterflymovement.health',
    'https://admin.thebutterflymovement.health',
    'https://www.thebutterflymovement.health',
    'https://thebutterflymovement.health',
  ];

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );

  app.use(cookieParser());

  app.enableCors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Additional protection for cookie-authenticated write requests.
  app.use(
    (
      req: Request,
      _res: Response,
      next: NextFunction,
    ) => {
      const writeMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

      if (!writeMethods.includes(req.method)) {
        next();
        return;
      }

      const origin = req.headers.origin;

      if (origin && !allowedOrigins.includes(origin)) {
        next(new BadRequestException('Invalid request origin'));
        return;
      }

      next();
    },
  );

  if (config.get<string>('NODE_ENV') === 'production') {
    const expressApp = app.getHttpAdapter().getInstance();
    expressApp.set('trust proxy', 1);
  }

  const port = config.get<number>('PORT') ?? 4000;
  await app.listen(port);
}

bootstrap();