import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { env } from '../../config/env';
import { SendEmailJob } from '@repo/types';
import { JOBS, QUEUES } from '@repo/shared';

@Injectable()
export class EmailQueueService implements OnModuleDestroy {
  private queue: Queue<SendEmailJob>;

  constructor() {
    this.queue = new Queue<SendEmailJob>(QUEUES.EMAIL, {
      connection: {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
      },
    });
  }

  async enqueueSendEmail(job: SendEmailJob) {
    await this.queue.add(JOBS.SEND_EMAIL, job);
  }

  async onModuleDestroy() {
    await this.queue.close();
  }
}
