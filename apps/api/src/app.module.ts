import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WorkspaceInvitationsModule } from './modules/workspace-invitations/workspace-invitations.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { SendersModule } from './modules/senders/senders.module';
import { ThreadsModule } from './modules/threads/threads.module';
import { MessagesModule } from './modules/messages/messages.module';
import { DraftsModule } from './modules/drafts/drafts.module';

@Module({
  imports: [AuthModule, WorkspacesModule, WorkspaceInvitationsModule, ContactsModule, SendersModule, ThreadsModule, MessagesModule, DraftsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
