import { Injectable } from '@nestjs/common';
import { SendersRepository } from './senders-repository';
import { AppError } from '../../errors/AppError';
import { ERROR_CODES } from '../../utils/error-codes';
import { STATUS_CODES } from '../../utils/status-codes';
import { MESSAGES } from '../../utils/messages';
import type {
  CreateSenderInput,
  UpdateSenderInput,
  ListSendersQuery,
} from '@repo/shared';

@Injectable()
export class SendersService {
  constructor(private readonly sendersRepository: SendersRepository) {}

  async createSender(input: CreateSenderInput, workspaceId: string) {
    const existing =
      await this.sendersRepository.findByEmailAndProviderInWorkspace(
        workspaceId,
        input.email,
        input.provider,
      );
    if (existing) {
      throw new AppError(
        ERROR_CODES.SENDER_ALREADY_EXISTS,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.SENDER_ALREADY_EXISTS,
      );
    }

    return this.sendersRepository.createSender({ ...input, workspaceId });
  }

  async getSender(id: string, workspaceId: string) {
    const sender = await this.sendersRepository.findById(id);

    if (!sender) {
      throw new AppError(
        ERROR_CODES.SENDER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.SENDER_NOT_FOUND,
      );
    }

    if (sender.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.SENDER_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.SENDER_NOT_IN_WORKSPACE,
      );
    }

    return sender;
  }

  async listSenders(workspaceId: string, query: ListSendersQuery) {
    return this.sendersRepository.findManyByWorkspace(workspaceId, query);
  }

  async updateSender(
    id: string,
    workspaceId: string,
    input: UpdateSenderInput,
  ) {
    const sender = await this.sendersRepository.findById(id);

    if (!sender) {
      throw new AppError(
        ERROR_CODES.SENDER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.SENDER_NOT_FOUND,
      );
    }

    if (sender.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.SENDER_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.SENDER_NOT_IN_WORKSPACE,
      );
    }

    if (
      input.email !== undefined &&
      input.provider !== undefined &&
      (input.email !== sender.email || input.provider !== sender.provider)
    ) {
      const conflict =
        await this.sendersRepository.findByEmailAndProviderInWorkspace(
          workspaceId,
          input.email,
          input.provider,
        );
      if (conflict) {
        throw new AppError(
          ERROR_CODES.SENDER_ALREADY_EXISTS,
          STATUS_CODES.CONFLICT,
          MESSAGES.error.SENDER_ALREADY_EXISTS,
        );
      }
    }

    return this.sendersRepository.updateSender(id, input);
  }

  async deleteSender(id: string, workspaceId: string) {
    const sender = await this.sendersRepository.findById(id);

    if (!sender) {
      throw new AppError(
        ERROR_CODES.SENDER_NOT_FOUND,
        STATUS_CODES.NOT_FOUND,
        MESSAGES.error.SENDER_NOT_FOUND,
      );
    }

    if (sender.workspaceId !== workspaceId) {
      throw new AppError(
        ERROR_CODES.SENDER_NOT_IN_WORKSPACE,
        STATUS_CODES.FORBIDDEN,
        MESSAGES.error.SENDER_NOT_IN_WORKSPACE,
      );
    }

    const hasActiveThreads =
      await this.sendersRepository.hasActiveThreads(id);
    if (hasActiveThreads) {
      throw new AppError(
        ERROR_CODES.SENDER_HAS_ACTIVE_THREADS,
        STATUS_CODES.CONFLICT,
        MESSAGES.error.SENDER_HAS_ACTIVE_THREADS,
      );
    }

    return this.sendersRepository.deleteById(id);
  }
}