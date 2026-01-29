import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from '@/app.module';
import { envs } from '@config/index';
import { TransformInterceptor, AllExceptionsFilter } from '@common/index';

async function bootstrap() {
  const logger = new Logger('Main - KFE API');

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: envs.clientUrl,
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalInterceptors(new TransformInterceptor());

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('KFE API')
    .setDescription('API para gestión de productos y ventas')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(envs.port);

  logger.log(`API is running on port: ${envs.port}`);
  logger.log(`Swagger docs available at: http://localhost:${envs.port}/docs`);
}
bootstrap();
