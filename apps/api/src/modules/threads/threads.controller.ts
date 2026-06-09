import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ThreadsService } from './threads.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceIdGuard } from '../../guards/workspace-id.guard';
import { listThreadsQuerySchema } from '@repo/shared';
import type { WorkspaceRequest } from '../../utils/types';

@Controller('threads')
export class ThreadsController {
  constructor(private readonly threadsService: ThreadsService) {}

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async listThreads(@Query() query: unknown, @Req() req: WorkspaceRequest) {
    const parsed = listThreadsQuerySchema.parse(query);

    return this.threadsService.listThreads(req.workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async getThread(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.threadsService.getThread(id, req.workspaceId);
  }

  @Post(':id/close')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async closeThread(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.threadsService.closeThread(id, req.workspaceId);
  }

  @Post(':id/reopen')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async reopenThread(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.threadsService.reopenThread(id, req.workspaceId);
  }
}
