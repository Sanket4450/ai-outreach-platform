import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { WorkspaceInvitationsService } from './workspace-invitations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createInvitationSchema, registerFromInvitationSchema } from '@repo/shared';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('workspace-invitations')
export class WorkspaceInvitationsController {
  constructor(private readonly invitationsService: WorkspaceInvitationsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createInvitation(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const input = createInvitationSchema.parse(body);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.invitationsService.createInvitation(input, workspaceId, req.user.userId);
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
