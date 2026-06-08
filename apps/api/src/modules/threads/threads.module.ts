import { Module } from '@nestjs/common';
import { ThreadsRepository } from './threads-repository';
import { ThreadsService } from './threads.service';
import { ThreadsController } from './threads.controller';

@Module({
  controllers: [ThreadsController],
  providers: [ThreadsService, ThreadsRepository],
  exports: [ThreadsService],
})
export class ThreadsModule {}
