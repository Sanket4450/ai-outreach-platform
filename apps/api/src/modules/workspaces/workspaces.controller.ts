import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { createWorkspaceSchema } from '@repo/shared';
import type { UserRequest } from '../../utils/types';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createWorkspace(@Body() body: unknown, @Req() req: UserRequest) {
    const input = createWorkspaceSchema.parse(body);
    return this.workspacesService.createWorkspace(input, req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listWorkspaces(@Req() req: UserRequest) {
    return this.workspacesService.listWorkspaces(req.user.userId);
  }
}
