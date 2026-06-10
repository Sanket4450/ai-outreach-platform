import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { env } from './config/env';
import { SendEmailModule } from './modules/send-email/send-email.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
      },
    }),
    SendEmailModule,
  ],
})
export class AppModule {}
