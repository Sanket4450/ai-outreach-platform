import { Module } from '@nestjs/common';
import { SendersController } from './senders.controller';
import { SendersService } from './senders.service';
import { SendersRepository } from './senders-repository';

@Module({
  controllers: [SendersController],
  providers: [SendersService, SendersRepository],
  exports: [SendersService],
})
export class SendersModule {}