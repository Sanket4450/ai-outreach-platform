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
import type { Request } from 'express';
import { SendersService } from './senders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  createSenderSchema,
  updateSenderSchema,
  listSendersQuerySchema,
} from '@repo/shared';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('senders')
export class SendersController {
  constructor(private readonly sendersService: SendersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSender(
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const input = createSenderSchema.parse(body);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.sendersService.createSender(input, workspaceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listSenders(
    @Query() query: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const parsed = listSendersQuerySchema.parse(query);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.sendersService.listSenders(workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getSender(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.sendersService.getSender(id, workspaceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateSender(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const input = updateSenderSchema.parse(body);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.sendersService.updateSender(id, workspaceId, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteSender(
    @Param('id') id: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.sendersService.deleteSender(id, workspaceId);
  }
}