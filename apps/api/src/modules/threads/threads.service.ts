import { Injectable } from '@nestjs/common';
import { ThreadsRepository } from './threads-repository';
import { AppError } from '../../errors/AppError';
import type { ThreadStatus } from '@repo/types';
import { ERROR_CODES, MESSAGES, STATUS_CODES } from '@repo/shared';

@Injectable()
export class ThreadsService {
  constructor(private readonly threadsRepository: ThreadsRepository) {}

  async listThreads(
    workspaceId: string,
    query: { status?: ThreadStatus; page: number; pageSize: number },
  ) {
    return this.threadsRepository.findManyByWorkspace(workspaceId, query);
  }

  async getThread(id: string, workspaceId: string) {
    const thread = await this.threadsRepository.findById(id);

    if (!thread) {
      throw new AppError(
        ERROR_CODES.THREAD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.THREAD_NOT_FOUND,
      );
    }

    if (thread.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.THREAD_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.THREAD_NOT_IN_WORKSPACE,
      );
    }

    return thread;
  }

  async findOrCreateThread(workspaceId: string, contactId: string, senderId: string) {
    const existing = await this.threadsRepository.findExistingThread(
      workspaceId,
      contactId,
      senderId,
    );

    if (existing) {
      return existing;
    }

    return this.threadsRepository.createThread({
      workspaceId,
      contactId,
      senderId,
      status: 'waiting_reply',
    });
  }

  async closeThread(id: string, workspaceId: string) {
    const thread = await this.threadsRepository.findById(id);

    if (!thread) {
      throw new AppError(
        ERROR_CODES.THREAD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.THREAD_NOT_FOUND,
      );
    }

    if (thread.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.THREAD_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.THREAD_NOT_IN_WORKSPACE,
      );
    }

    return this.threadsRepository.updateStatus(id, 'closed');
  }

  async reopenThread(id: string, workspaceId: string) {
    const thread = await this.threadsRepository.findById(id);

    if (!thread) {
      throw new AppError(
        ERROR_CODES.THREAD_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.THREAD_NOT_FOUND,
      );
    }

    if (thread.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.THREAD_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.THREAD_NOT_IN_WORKSPACE,
      );
    }

    return this.threadsRepository.updateStatus(id, 'needs_action');
  }

  async updateThreadLastMessageAt(id: string, lastMessageAt: Date) {
    return this.threadsRepository.updateLastMessageAt(id, lastMessageAt);
  }

  async updateThreadStatus(id: string, status: ThreadStatus) {
    return this.threadsRepository.updateStatus(id, status);
  }
}
