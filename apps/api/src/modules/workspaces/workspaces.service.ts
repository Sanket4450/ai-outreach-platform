import { Injectable } from '@nestjs/common';
import { WorkspacesRepository } from './workspaces-repository';
import type { CreateWorkspaceInput } from '@repo/shared';

@Injectable()
export class WorkspacesService {
  constructor(private readonly workspacesRepository: WorkspacesRepository) {}

  async createWorkspace(input: CreateWorkspaceInput, userId: string) {
    const workspace = await this.workspacesRepository.createWorkspace({
      name: input.name,
    });

    await this.workspacesRepository.createMembership({
      workspaceId: workspace.id,
      userId,
      role: 'owner',
    });

    return workspace;
  }

  async listWorkspaces(userId: string) {
    return this.workspacesRepository.findWorkspacesByUserId(userId);
  }
}
