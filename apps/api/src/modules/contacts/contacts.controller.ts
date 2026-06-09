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
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { WorkspaceIdGuard } from '../../guards/workspace-id.guard';
import { createContactSchema, updateContactSchema, listContactsQuerySchema } from '@repo/shared';
import type { WorkspaceRequest } from '../../utils/types';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async createContact(@Body() body: unknown, @Req() req: WorkspaceRequest) {
    const input = createContactSchema.parse(body);

    return this.contactsService.createContact(input, req.workspaceId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async listContacts(@Query() query: unknown, @Req() req: WorkspaceRequest) {
    const parsed = listContactsQuerySchema.parse(query);

    return this.contactsService.listContacts(req.workspaceId, parsed);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async getContact(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.contactsService.getContact(id, req.workspaceId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async updateContact(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() req: WorkspaceRequest,
  ) {
    const input = updateContactSchema.parse(body);

    return this.contactsService.updateContact(id, req.workspaceId, input);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, WorkspaceIdGuard)
  async deleteContact(@Param('id') id: string, @Req() req: WorkspaceRequest) {
    return this.contactsService.deleteContact(id, req.workspaceId);
  }
}
