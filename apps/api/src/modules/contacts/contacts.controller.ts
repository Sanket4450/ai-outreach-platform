import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { createContactSchema, updateContactSchema, listContactsQuerySchema } from '@repo/shared';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createContact(@Body() body: unknown, @Req() req: AuthenticatedRequest) {
    const input = createContactSchema.parse(body);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.contactsService.createContact(input, workspaceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async listContacts(@Query() query: unknown, @Req() req: AuthenticatedRequest) {
    const parsed = listContactsQuerySchema.parse(query);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.contactsService.listContacts(workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getContact(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.contactsService.getContact(id, workspaceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateContact(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: AuthenticatedRequest,
  ) {
    const input = updateContactSchema.parse(body);
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.contactsService.updateContact(id, workspaceId, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteContact(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const workspaceId = req.headers['x-workspace-id'] as string;

    if (!workspaceId) {
      throw new Error('Missing x-workspace-id header');
    }

    return this.contactsService.deleteContact(id, workspaceId);
  }
}