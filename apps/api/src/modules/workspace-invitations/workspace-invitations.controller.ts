import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { WorkspaceInvitationsService } from './workspace-invitations.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceIdGuard } from '../../guards/workspace-id.guard';
import { createInvitationSchema, registerFromInvitationSchema } from '@repo/shared';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
  workspaceId: string;
}

@Controller('workspace-invitations')
export class WorkspaceInvitationsController {
  constructor(private readonly invitationsService: WorkspaceInvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async createInvitation(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const input = createInvitationSchema.parse(body);

    return this.invitationsService.createInvitation(input, req.workspaceId, req.user.userId);
  }

  @Get(':token')
  async getInvitation(@Param('token') token: string) {
    return this.invitationsService.getInvitation(token);
  }

  @Post(':token/accept')
  @UseGuards(JwtAuthGuard)
  async acceptInvitation(@Param('token') token: string, @Req() req: AuthenticatedRequest) {
    return this.invitationsService.acceptInvitation(token, req.user.userId, req.user.email);
  }

  @Post(':token/register')
  async registerFromInvitation(@Param('token') token: string, @Body() body: unknown) {
    const input = registerFromInvitationSchema.parse(body);
    return this.invitationsService.registerFromInvitation(token, input);
  }
}
