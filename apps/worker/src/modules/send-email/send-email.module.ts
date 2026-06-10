import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SendEmailProcessor } from './send-email.processor';
import { QUEUES } from '@repo/shared';

@Module({
  imports: [BullModule.registerQueue({ name: QUEUES.EMAIL })],
  providers: [SendEmailProcessor],
})
export class SendEmailModule {}
