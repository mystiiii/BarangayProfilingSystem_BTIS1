import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS to allow the frontend HTML client to query endpoints
  app.enableCors();
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`Backend server running on: http://localhost:${port}`);
}

bootstrap();
