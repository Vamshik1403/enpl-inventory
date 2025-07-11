import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Serve only the gst-certificates folder as static files
  app.useStaticAssets(join(__dirname, '..', 'uploads', 'gst-certificates'), {
    prefix: '/gst',
  });

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();
