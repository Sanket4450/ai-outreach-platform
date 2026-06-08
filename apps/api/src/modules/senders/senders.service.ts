import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SendersRepository } from './senders-repository';
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
      throw new ConflictException(
        'Sender with this email and provider already exists in this workspace',
      );
    }

    return this.sendersRepository.createSender({ ...input, workspaceId });
  }

  async getSender(id: string, workspaceId: string) {
    const sender = await this.sendersRepository.findById(id);

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    if (sender.workspaceId !== workspaceId) {
      throw new ForbiddenException('Sender does not belong to this workspace');
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
      throw new NotFoundException('Sender not found');
    }

    if (sender.workspaceId !== workspaceId) {
      throw new ForbiddenException('Sender does not belong to this workspace');
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
        throw new ConflictException(
          'Sender with this email and provider already exists in this workspace',
        );
      }
    }

    return this.sendersRepository.updateSender(id, input);
  }

  async deleteSender(id: string, workspaceId: string) {
    const sender = await this.sendersRepository.findById(id);

    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    if (sender.workspaceId !== workspaceId) {
      throw new ForbiddenException('Sender does not belong to this workspace');
    }

    const hasActiveThreads =
      await this.sendersRepository.hasActiveThreads(id);
    if (hasActiveThreads) {
      throw new ConflictException(
        'Cannot delete sender that is referenced by active threads',
      );
    }

    return this.sendersRepository.deleteById(id);
  }
}