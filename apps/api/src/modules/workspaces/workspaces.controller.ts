import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createWorkspaceSchema } from '@repo/shared';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createWorkspace(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const input = createWorkspaceSchema.parse(body);
    return this.workspacesService.createWorkspace(input, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listWorkspaces(@Req() req: AuthenticatedRequest) {
    return this.workspacesService.listWorkspaces(req.user.userId);
  }
}
