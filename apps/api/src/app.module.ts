import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { WorkspaceInvitationsModule } from './modules/workspace-invitations/workspace-invitations.module';
import { ContactsModule } from './modules/contacts/contacts.module';

@Module({
  imports: [AuthModule, WorkspacesModule, WorkspaceInvitationsModule, ContactsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
