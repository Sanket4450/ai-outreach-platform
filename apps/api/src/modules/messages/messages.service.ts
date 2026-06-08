import { Injectable } from '@nestjs/common';
import { MessagesRepository } from './messages-repository';
import { ThreadsService } from '../threads/threads.service';
import { AppError } from '../../errors/AppError';
import { ERROR_CODES } from '../../utils/error-codes';
import { STATUS_CODES } from '../../utils/status-codes';
import { MESSAGES } from '../../utils/messages';
import type { CreateMessageInput, ListMessagesQuery } from '@repo/shared';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messagesRepository: MessagesRepository,
    private readonly threadsService: ThreadsService,
  ) {}

  async listMessages(workspaceId: string, query: ListMessagesQuery) {
    const thread = await this.threadsService.getThread(query.threadId, workspaceId);

    return this.messagesRepository.findManyByThreadId(thread.id, {
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  async getMessage(id: string, workspaceId: string) {
    const message = await this.messagesRepository.findById(id);

    if (!message) {
      throw new AppError(
        ERROR_CODES.MESSAGE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.MESSAGE_NOT_FOUND,
      );
    }

    if (message.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.MESSAGE_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.MESSAGE_NOT_IN_WORKSPACE,
      );
    }

    return message;
  }

  async createOutboundMessage(
    input: CreateMessageInput,
    workspaceId: string,
    context: { fromEmail: string; toEmail: string; fromName?: string; toName?: string },
  ) {
    const thread = await this.threadsService.getThread(input.threadId, workspaceId);

    const message = await this.messagesRepository.createMessage({
      workspaceId: thread.workspaceId,
      threadId: thread.id,
      direction: 'outbound',
      status: 'queued',
      fromEmail: context.fromEmail,
      toEmail: context.toEmail,
      fromName: context.fromName,
      toName: context.toName,
      subject: input.subject,
      body: input.body,
    });

    await this.threadsService.updateThreadLastMessageAt(thread.id, new Date());

    return message;
  }

  async createInboundMessage(input: {
    threadId: string;
    workspaceId: string;
    fromEmail: string;
    toEmail: string;
    fromName?: string;
    toName?: string;
    subject: string;
    body: string;
    providerMessageId?: string;
  }) {
    const thread = await this.threadsService.getThread(input.threadId, input.workspaceId);

    const message = await this.messagesRepository.createMessage({
      workspaceId: thread.workspaceId,
      threadId: thread.id,
      direction: 'inbound',
      status: 'sent',
      fromEmail: input.fromEmail,
      toEmail: input.toEmail,
      fromName: input.fromName,
      toName: input.toName,
      subject: input.subject,
      body: input.body,
    });

    await this.threadsService.updateThreadStatus(thread.id, 'needs_action');
    await this.threadsService.updateThreadLastMessageAt(thread.id, new Date());

    return message;
  }

  async markSent(id: string, workspaceId: string) {
    const message = await this.getMessage(id, workspaceId);

    if (message.status === 'sent') {
      throw new AppError(
        ERROR_CODES.MESSAGE_ALREADY_SENT,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.MESSAGE_ALREADY_SENT,
      );
    }

    const updated = await this.messagesRepository.markSent(id, new Date());

    if (!updated) {
      throw new AppError(
        ERROR_CODES.MESSAGE_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.MESSAGE_NOT_FOUND,
      );
    }

    return updated;
  }

  async markDelivered(id: string, workspaceId: string) {
    const message = await this.getMessage(id, workspaceId);

    return this.messagesRepository.markDelivered(id, new Date());
  }

  async markOpened(id: string, workspaceId: string) {
    const message = await this.getMessage(id, workspaceId);

    return this.messagesRepository.markOpened(id, new Date());
  }

  async markClicked(id: string, workspaceId: string) {
    const message = await this.getMessage(id, workspaceId);

    return this.messagesRepository.markClicked(id, new Date());
  }

  async markBounced(id: string, workspaceId: string) {
    const message = await this.getMessage(id, workspaceId);

    return this.messagesRepository.markBounced(id, new Date());
  }
}