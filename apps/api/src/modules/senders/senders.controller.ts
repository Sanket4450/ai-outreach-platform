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
import { SendersService } from './senders.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceIdGuard } from '../../guards/workspace-id.guard';
import {
  createSenderSchema,
  updateSenderSchema,
  listSendersQuerySchema,
} from '@repo/shared';
import type { WorkspaceRequest } from '../../utils/types';

@Controller('senders')
export class SendersController {
  constructor(private readonly sendersService: SendersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async createSender(@Body() body: unknown, @Req() req: WorkspaceRequest) {
    const input = createSenderSchema.parse(body);

    return this.sendersService.createSender(input, req.workspaceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async listSenders(@Query() query: unknown, @Req() req: WorkspaceRequest) {
    const parsed = listSendersQuerySchema.parse(query);

    return this.sendersService.listSenders(req.workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async getSender(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.sendersService.getSender(id, req.workspaceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async updateSender(@Param('id') id: string, @Body() body: unknown, @Req() req: WorkspaceRequest) {
    const input = updateSenderSchema.parse(body);

    return this.sendersService.updateSender(id, req.workspaceId, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async deleteSender(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.sendersService.deleteSender(id, req.workspaceId);
  }
}
