import { join } from 'node:path';
import { config as loadEnv } from 'dotenv';
// Local dev: load apps/api/.env (dist/main.js → ../.env). In Docker the env
// comes from compose, the file is absent, and this is a harmless no-op.
loadEnv({ path: join(__dirname, '..', '.env') });

import { initSentry } from './sentry';
// Before Nest, before express, before pg: the SDK instruments those modules as
// they are required, and one already loaded is one it cannot see.
initSentry();

import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser = require('cookie-parser');
import { AppModule } from './app/app.module';
import { readMinScore } from './app/common/captcha/captcha.service';
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

/**
 * Variables that have no safe default, checked at boot rather than at the
 * first request that needs them (audit A3, F5; PLAN.md 11d).
 *
 * Each of these used to fall back to something that looked like it worked:
 * lead notifications went to a developer's personal Gmail, the captcha turned
 * itself off, and private medical uploads landed in the container's working
 * directory, where they vanish on the next deploy. All three are silent, and
 * a silent wrong default in production is worse than a container that will
 * not start.
 */
const REQUIRED_IN_PRODUCTION = [
  'LEADS_NOTIFY_EMAIL',
  'RECAPTCHA_SECRET',
  'PRIVATE_UPLOADS_DIR',
  'PUBLIC_API_URL',
  'PUBLIC_SITE_URL',
  // Two more with the same shape, found by audit A11 (M11). CORS_ORIGINS falls
  // back to two localhost origins, so a deployment that forgot it answers the
  // real back office with a CORS error and the developer's laptop with a
  // session; UPLOADS_DIR falls back to the working directory, which is inside
  // the container and empties on the next deploy, taking every image the
  // client uploaded with it.
  'CORS_ORIGINS',
  'UPLOADS_DIR',
] as const;

function requireProductionEnv(): void {
  if (process.env.NODE_ENV !== 'production') return;

  const missing = REQUIRED_IN_PRODUCTION.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    Logger.error(
      `Missing required production environment: ${missing.join(', ')}. ` +
        'Each of these has no safe default — see docs/deployment.md. Set them and start again.',
    );
    process.exit(1);
  }

  /**
   * Set but unreadable is the same class of problem as unset, and worse to
   * diagnose: a typo here used to disable the score check without a word
   * (audit A5, F19). In development the service falls back to 0.5 and logs it;
   * in production a spam filter that quietly stopped filtering is not a
   * degradation anyone would notice.
   */
  const { problem } = readMinScore(process.env.RECAPTCHA_MIN_SCORE);
  if (problem) {
    Logger.error(`${problem} Fix it and start again.`);
    process.exit(1);
  }
}

async function bootstrap() {
  requireJwtSecrets();
  requireProductionEnv();

  // `rawBody: true` preserves the unparsed request body (req.rawBody) so the
  // Calendly webhook can verify its HMAC signature against the exact bytes.
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
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
   * assets below, which set their own CORP header).
   */
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
    }),
  );

  /**
   * Uploaded files at /uploads/* (outside the /api prefix), registered AFTER
   * helmet on purpose: Express runs middleware in registration order, and while
   * this sat first every stored file was served with no `X-Content-Type-Options`
   * and no `X-Frame-Options` at all (audit A4, F4) — the one route on this API
   * that returns something a browser will happily render.
   *
   * The CORP header lets the cross-origin frontend (:3000) load them; without
   * it the browser blocks the response (ERR_BLOCKED_BY_ORB).
   */
  app.useStaticAssets(STORAGE_DIR, {
    prefix: `${STORAGE_URL_PREFIX}/`,
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    },
  });

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
    origin: (
      process.env.CORS_ORIGINS ?? 'http://localhost:3000,http://localhost:4200'
    )
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
    // `Retry-After` is not a CORS-safelisted response header, and it is the
    // only place the throttler says how long a refused login must wait — the
    // number the panel now counts down on (audit A13). The panel usually
    // reaches the API same-origin, through the Vite proxy in development and
    // nginx in production, where this changes nothing; it is for the origins
    // `CORS_ORIGINS` lists, which are real setups and would otherwise get a
    // countdown with no number in it.
    exposedHeaders: ['Retry-After'],
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
