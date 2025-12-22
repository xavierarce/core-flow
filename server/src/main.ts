import 'dotenv/config'; // THIS MUST BE THE ABSOLUTE FIRST LINE
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Check if the URL is actually there before Nest starts
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in .env file');
  }

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log(`🚀 Server ready at: http://localhost:3000`);
}
bootstrap();
