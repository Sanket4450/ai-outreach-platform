import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { env } from '../../config/env';
import { WorkspaceInvitationsController } from './workspace-invitations.controller';
import { WorkspaceInvitationsService } from './workspace-invitations.service';
import { WorkspaceInvitationsRepository } from './workspace-invitations-repository';
import { AuthModule } from '../auth/auth.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';

@Module({
  imports: [
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    JwtModule.register({
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: env.JWT_EXPIRES_IN as never },
    }),
    AuthModule,
    WorkspacesModule,
  ],
  controllers: [WorkspaceInvitationsController],
  providers: [WorkspaceInvitationsService, WorkspaceInvitationsRepository],
  exports: [WorkspaceInvitationsService],
})
export class WorkspaceInvitationsModule {}
