import { Logger, RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Olesea API')
    .setDescription('Backend API for the olesia-website-med platform')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  Logger.log(`🚀 API running on http://localhost:${port}/api — docs at /api/docs`);
}

bootstrap();
