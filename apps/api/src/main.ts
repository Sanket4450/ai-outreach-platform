import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from '@repo/shared';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  console.log(env)

  await app.listen(8000, () => {
    console.log('API is running on PORT:', 8000);
  });
}
bootstrap();
