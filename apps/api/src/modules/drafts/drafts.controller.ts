import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { DraftsService } from './drafts.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceIdGuard } from '../../guards/workspace-id.guard';
import { createDraftSchema, updateDraftSchema, listDraftsQuerySchema } from '@repo/shared';
import type { WorkspaceRequest } from '../../utils/types';

@Controller('drafts')
export class DraftsController {
  constructor(private readonly draftsService: DraftsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async create(@Body() body: unknown, @Req() req: WorkspaceRequest) {
    createDraftSchema.parse(body);

    return this.draftsService.createDraft(req.workspaceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async list(@Query() query: unknown, @Req() req: WorkspaceRequest) {
    const parsed = listDraftsQuerySchema.parse(query);

    return this.draftsService.listDrafts(req.workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async get(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.draftsService.getDraft(id, req.workspaceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async update(@Param('id') id: string, @Body() body: unknown, @Req() req: WorkspaceRequest) {
    const input = updateDraftSchema.parse(body);

    return this.draftsService.updateDraft(id, req.workspaceId, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async delete(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.draftsService.deleteDraft(id, req.workspaceId);
  }

  @Post(':id/send')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async send(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.draftsService.sendDraft(id, req.workspaceId);
  }
}
