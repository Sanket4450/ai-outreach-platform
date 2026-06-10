import { Module } from '@nestjs/common';
import { DraftsRepository } from './drafts-repository';
import { DraftsService } from './drafts.service';
import { DraftsController } from './drafts.controller';
import { MessagesModule } from '../messages/messages.module';
import { ThreadsModule } from '../threads/threads.module';
import { ContactsModule } from '../contacts/contacts.module';
import { SendersModule } from '../senders/senders.module';
import { EmailQueueModule } from '../email-queue/email-queue.module';

@Module({
  imports: [MessagesModule, ThreadsModule, ContactsModule, SendersModule, EmailQueueModule],
  controllers: [DraftsController],
  providers: [DraftsService, DraftsRepository],
  exports: [DraftsService],
})
export class DraftsModule {}
