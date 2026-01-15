import 'dotenv/config'; // THIS MUST BE THE ABSOLUTE FIRST LINE
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
// import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'; // Optional for strict mode

async function bootstrap() {
  // Check if the URL is actually there before Nest starts
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in .env file');
  }

  const app = await NestFactory.create(AppModule);

  // Enable validation
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  // Enable CORS (Frontend port 3000)
  app.enableCors({ origin: 'http://localhost:3001' });

  await app.listen(3000);
  console.log(`🚀 Server ready at: http://localhost:3000`);
}
bootstrap();
