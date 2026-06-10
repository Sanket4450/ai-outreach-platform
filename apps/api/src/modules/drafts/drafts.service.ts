import { Injectable } from '@nestjs/common';
import { DraftsRepository } from './drafts-repository';
import { MessagesService } from '../messages/messages.service';
import { ThreadsService } from '../threads/threads.service';
import { ContactsService } from '../contacts/contacts.service';
import { SendersService } from '../senders/senders.service';
import { EmailQueueService } from '../email-queue/email-queue.service';
import { AppError } from '../../errors/AppError';
import {
  type UpdateDraftInput,
  type ListDraftsQuery,
  ERROR_CODES,
  STATUS_CODES,
  MESSAGES,
} from '@repo/shared';

@Injectable()
export class DraftsService {
  constructor(
    private readonly draftsRepository: DraftsRepository,
    private readonly messagesService: MessagesService,
    private readonly threadsService: ThreadsService,
    private readonly contactsService: ContactsService,
    private readonly sendersService: SendersService,
    private readonly emailQueueService: EmailQueueService,
  ) {}

  async createDraft(workspaceId: string) {
    return this.draftsRepository.createDraft(workspaceId);
  }

  async listDrafts(workspaceId: string, query: ListDraftsQuery) {
    return this.draftsRepository.findManyByWorkspace(workspaceId, {
      status: query.status,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async getDraft(id: string, workspaceId: string) {
    const draft = await this.draftsRepository.findById(id);

    if (!draft) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.DRAFT_NOT_FOUND,
      );
    }

    if (draft.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.DRAFT_NOT_IN_WORKSPACE,
      );
    }

    return draft;
  }

  async updateDraft(id: string, workspaceId: string, input: UpdateDraftInput) {
    const draft = await this.draftsRepository.findById(id);

    if (!draft) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.DRAFT_NOT_FOUND,
      );
    }

    if (draft.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.DRAFT_NOT_IN_WORKSPACE,
      );
    }

    if (draft.status === 'sent') {
      throw new AppError(
        ERROR_CODES.DRAFT_ALREADY_SENT,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.DRAFT_ALREADY_SENT,
      );
    }

    if (draft.status === 'discarded') {
      throw new AppError(
        ERROR_CODES.DRAFT_ALREADY_DISCARDED,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.DRAFT_ALREADY_DISCARDED,
      );
    }

    return this.draftsRepository.updateDraft(id, { ...input, status: 'edited' });
  }

  async deleteDraft(id: string, workspaceId: string) {
    const draft = await this.draftsRepository.findById(id);

    if (!draft) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.DRAFT_NOT_FOUND,
      );
    }

    if (draft.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.DRAFT_NOT_IN_WORKSPACE,
      );
    }

    return this.draftsRepository.updateStatus(id, 'discarded');
  }

  async sendDraft(id: string, workspaceId: string) {
    const draft = await this.draftsRepository.findById(id);

    if (!draft) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.DRAFT_NOT_FOUND,
      );
    }

    if (draft.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.DRAFT_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.DRAFT_NOT_IN_WORKSPACE,
      );
    }

    if (draft.status === 'sent') {
      throw new AppError(
        ERROR_CODES.DRAFT_ALREADY_SENT,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.DRAFT_ALREADY_SENT,
      );
    }

    if (draft.status === 'discarded') {
      throw new AppError(
        ERROR_CODES.DRAFT_ALREADY_DISCARDED,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.DRAFT_ALREADY_DISCARDED,
      );
    }

    // Validate required fields
    if (!draft.subject || !draft.body || !draft.contactId || !draft.senderId) {
      throw new AppError(
        ERROR_CODES.DRAFT_CANNOT_BE_SENT,
        STATUS_CODES.BAD_REQUEST,
        MESSAGES.error.DRAFT_CANNOT_BE_SENT,
      );
    }

    // Resolve contact
    const contact = await this.contactsService.getContact(draft.contactId, workspaceId);

    // Resolve sender
    const sender = await this.sendersService.getSender(draft.senderId, workspaceId);

    // Find or create thread via threadsService
    const thread = await this.threadsService.findOrCreateThread(workspaceId, contact.id, sender.id);

    // Create outbound message via messagesService (also updates thread lastMessageAt)
    const message = await this.messagesService.createOutboundMessage(
      {
        threadId: thread.id,
        subject: draft.subject,
        body: draft.body,
      },
      workspaceId,
      {
        fromEmail: sender.email,
        toEmail: contact.email,
        fromName: sender.name,
        toName: `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || undefined,
      },
    );

    // Update thread status to waiting_reply
    await this.threadsService.updateThreadStatus(thread.id, 'waiting_reply');

    // Link draft to thread
    await this.draftsRepository.linkToThread(id, thread.id);

    // Enqueue email delivery job
    await this.emailQueueService.enqueueSendEmail({
      workspaceId,
      messageId: message.id,
    });

    // Mark draft as sent
    return this.draftsRepository.updateStatus(id, 'sent');
  }
}
