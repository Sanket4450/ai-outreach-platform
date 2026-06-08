import { Injectable, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ContactsRepository } from './contacts-repository';
import type { CreateContactInput, UpdateContactInput, ListContactsQuery } from '@repo/shared';

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  async createContact(input: CreateContactInput, workspaceId: string) {
    const existing = await this.contactsRepository.findByEmailInWorkspace(workspaceId, input.email);
    if (existing) {
      throw new ConflictException('Contact with this email already exists in this workspace');
    }

    return this.contactsRepository.createContact({ ...input, workspaceId });
  }

  async getContact(id: string, workspaceId: string) {
    const contact = await this.contactsRepository.findActiveById(id);

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.workspaceId !== workspaceId) {
      throw new ForbiddenException('Contact does not belong to this workspace');
    }

    return contact;
  }

  async listContacts(workspaceId: string, query: ListContactsQuery) {
    return this.contactsRepository.findManyByWorkspace(workspaceId, query);
  }

  async updateContact(id: string, workspaceId: string, input: UpdateContactInput) {
    const contact = await this.contactsRepository.findActiveById(id);

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.workspaceId !== workspaceId) {
      throw new ForbiddenException('Contact does not belong to this workspace');
    }

    if (input.email && input.email !== contact.email) {
      const emailConflict = await this.contactsRepository.findByEmailInWorkspace(workspaceId, input.email);
      if (emailConflict) {
        throw new ConflictException('Contact with this email already exists in this workspace');
      }
    }

    return this.contactsRepository.updateContact(id, input);
  }

  async deleteContact(id: string, workspaceId: string) {
    const contact = await this.contactsRepository.findActiveById(id);

    if (!contact) {
      throw new NotFoundException('Contact not found');
    }

    if (contact.workspaceId !== workspaceId) {
      throw new ForbiddenException('Contact does not belong to this workspace');
    }

    return this.contactsRepository.softDelete(id);
  }
}