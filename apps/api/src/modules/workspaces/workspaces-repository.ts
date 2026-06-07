import { Injectable } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { workspaces, workspaceMembers } from '@repo/db';
import type { WorkspaceRole } from '@repo/shared';

@Injectable()
export class WorkspacesRepository {
  async createWorkspace(input: { name: string }) {
    const [workspace] = await db
      .insert(workspaces)
      .values({
        id: v7(),
        name: input.name,
      })
      .returning();

    return workspace;
  }

  async createMembership(input: { workspaceId: string; userId: string; role: WorkspaceRole }) {
    const [member] = await db
      .insert(workspaceMembers)
      .values({
        id: v7(),
        workspaceId: input.workspaceId,
        userId: input.userId,
        role: input.role,
      })
      .returning();

    return member;
  }

  async findWorkspacesByUserId(userId: string) {
    const rows = await db
      .select({
        workspace: workspaces,
        role: workspaceMembers.role,
      })
      .from(workspaceMembers)
      .innerJoin(workspaces, eq(workspaceMembers.workspaceId, workspaces.id))
      .where(eq(workspaceMembers.userId, userId));

    return rows.map((r) => ({ ...r.workspace, role: r.role }));
  }

  async findMembership(input: { workspaceId: string; userId: string }) {
    const [member] = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, input.workspaceId),
          eq(workspaceMembers.userId, input.userId),
        ),
      );

    return member ?? null;
  }

  async findOwnerCount(workspaceId: string) {
    const rows = await db
      .select()
      .from(workspaceMembers)
      .where(
        and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.role, 'owner')),
      );

    return rows.length;
  }
}
