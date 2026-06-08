import { Controller, Get, Param, Post, Query, Req, Body, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { MessagesService } from './messages.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceIdGuard } from '../../guards/workspace-id.guard';
import { createMessageSchema, listMessagesQuerySchema } from '@repo/shared';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
  workspaceId: string;
}

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async listMessages(@Query() query: unknown, @Req() req: AuthenticatedRequest) {
    const parsed = listMessagesQuerySchema.parse(query);

    return this.messagesService.listMessages(req.workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async getMessage(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.messagesService.getMessage(id, req.workspaceId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async createMessage(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const parsed = createMessageSchema.parse(body);

    return this.messagesService.createOutboundMessage(
      parsed,
      req.workspaceId,
      {
        fromEmail: req.user.email,
        toEmail: '', // Will be resolved from thread's contact in service
      },
    );
  }

  @Post(':id/mark-sent')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async markSent(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.messagesService.markSent(id, req.workspaceId);
  }

  @Post(':id/mark-delivered')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async markDelivered(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.messagesService.markDelivered(id, req.workspaceId);
  }

  @Post(':id/mark-opened')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async markOpened(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.messagesService.markOpened(id, req.workspaceId);
  }

  @Post(':id/mark-clicked')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async markClicked(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.messagesService.markClicked(id, req.workspaceId);
  }

  @Post(':id/mark-bounced')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async markBounced(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.messagesService.markBounced(id, req.workspaceId);
  }
}