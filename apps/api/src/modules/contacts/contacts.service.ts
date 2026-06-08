import { Injectable } from '@nestjs/common';
import { ContactsRepository } from './contacts-repository';
import { AppError } from '../../errors/AppError';
import { ERROR_CODES } from '../../utils/error-codes';
import { STATUS_CODES } from '../../utils/status-codes';
import { MESSAGES } from '../../utils/messages';
import type { CreateContactInput, UpdateContactInput, ListContactsQuery } from '@repo/shared';

@Injectable()
export class ContactsService {
  constructor(private readonly contactsRepository: ContactsRepository) {}

  async createContact(input: CreateContactInput, workspaceId: string) {
    const existing = await this.contactsRepository.findByEmailInWorkspace(workspaceId, input.email);
    if (existing) {
      throw new AppError(
        ERROR_CODES.CONTACT_ALREADY_EXISTS,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.CONTACT_ALREADY_EXISTS,
      );
    }

    return this.contactsRepository.createContact({ ...input, workspaceId });
  }

  async getContact(id: string, workspaceId: string) {
    const contact = await this.contactsRepository.findActiveById(id);

    if (!contact) {
      throw new AppError(
        ERROR_CODES.CONTACT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.CONTACT_NOT_FOUND,
      );
    }

    if (contact.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.CONTACT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.CONTACT_NOT_IN_WORKSPACE,
      );
    }

    return contact;
  }

  async listContacts(workspaceId: string, query: ListContactsQuery) {
    return this.contactsRepository.findManyByWorkspace(workspaceId, query);
  }

  async updateContact(id: string, workspaceId: string, input: UpdateContactInput) {
    const contact = await this.contactsRepository.findActiveById(id);

    if (!contact) {
      throw new AppError(
        ERROR_CODES.CONTACT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.CONTACT_NOT_FOUND,
      );
    }

    if (contact.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.CONTACT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.CONTACT_NOT_IN_WORKSPACE,
      );
    }

    if (input.email && input.email !== contact.email) {
      const emailConflict = await this.contactsRepository.findByEmailInWorkspace(workspaceId, input.email);
      if (emailConflict) {
        throw new AppError(
          ERROR_CODES.CONTACT_ALREADY_EXISTS,
          STATUS_CODES.CONFLICT,
          MESSAGES.error.CONTACT_ALREADY_EXISTS,
        );
      }
    }

    return this.contactsRepository.updateContact(id, input);
  }

  async deleteContact(id: string, workspaceId: string) {
    const contact = await this.contactsRepository.findActiveById(id);

    if (!contact) {
      throw new AppError(
        ERROR_CODES.CONTACT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.CONTACT_NOT_FOUND,
      );
    }

    if (contact.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.CONTACT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.CONTACT_NOT_IN_WORKSPACE,
      );
    }

    return this.contactsRepository.softDelete(id);
  }
}