import { join } from 'node:path';
import { config as loadEnv } from 'dotenv';
// Local dev: load apps/api/.env (dist/main.js → ../.env). In Docker the env
// comes from compose, the file is absent, and this is a harmless no-op.
loadEnv({ path: join(__dirname, '..', '.env') });

import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');
import { AppModule } from './app/app.module';
import {
  STORAGE_DIR,
  STORAGE_URL_PREFIX,
} from './app/storage/storage.constants';

/**
 * Both JWT secrets, or nothing. They used to fall back to a string committed to
 * this repository, so a deployment that forgot the variables kept working and
 * signed admin tokens anyone could forge. Refusing to start is the only honest
 * answer to a missing secret.
 */
function requireJwtSecrets(): void {
  const access = process.env.JWT_ACCESS_SECRET ?? '';
  const refresh = process.env.JWT_REFRESH_SECRET ?? '';
  const problem =
    access.length < 32 || refresh.length < 32
      ? 'must be at least 32 characters'
      : access === refresh
        ? 'must differ from each other'
        : null;

  if (problem) {
    Logger.error(
      `JWT_ACCESS_SECRET and JWT_REFRESH_SECRET ${problem}. Set both in the environment (see apps/api/.env.example) and start again.`,
    );
    process.exit(1);
  }
}

async function bootstrap() {
  requireJwtSecrets();

  // `rawBody: true` preserves the unparsed request body (req.rawBody) so the
  // Calendly webhook can verify its HMAC signature against the exact bytes.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  // Serve uploaded images from disk at /uploads/* (bypasses the /api prefix).
  // CORP header lets the cross-origin frontend (:3000) load them; without it
  // the browser blocks the response (ERR_BLOCKED_BY_ORB).
  app.useStaticAssets(STORAGE_DIR, {
    prefix: `${STORAGE_URL_PREFIX}/`,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

  /**
   * Behind a reverse proxy (Vercel, nginx, the cloudflared tunnel) the socket
   * address is the proxy's. Without this the rate limiter would bucket every
   * visitor together — one noisy client would lock out everyone.
   */
  app.set('trust proxy', 1);

  /**
   * Security headers (client answers v2 §10). No CSP here: this API serves
   * JSON and uploaded files, not HTML, and a policy would only be a
   * maintenance burden. `crossOriginResourcePolicy` stays off because uploads
   * are deliberately served cross-origin to the frontend (see the static
   * assets above, which set their own CORP header).
   */
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  // Refresh token travels in an httpOnly cookie.
  app.use(cookieParser());

  // Everything lives under /api except the health probe (kept at /health).
  app.setGlobalPrefix('api', {
    exclude: [{ path: 'health', method: RequestMethod.GET }],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: (process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4200')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  // Swagger mounts as plain middleware, outside the guards, so in production
  // it would publish the whole admin surface to anyone who asked.
  if (process.env.NODE_ENV !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Olesea API')
      .setDescription('Backend API for the olesia-website-med platform')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  Logger.log(`🚀 API running on http://localhost:${port}/api`);
}

bootstrap();
