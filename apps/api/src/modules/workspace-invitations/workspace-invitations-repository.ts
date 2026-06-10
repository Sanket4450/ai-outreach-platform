import { Injectable } from '@nestjs/common';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { workspaceInvitations, workspaceMembers } from '@repo/db';
import type { WorkspaceRole } from '@repo/types';

@Injectable()
export class WorkspaceInvitationsRepository {
  async createInvitation(input: {
    workspaceId: string;
    email: string;
    token: string;
    expiresAt: Date;
    createdBy: string;
  }) {
    const [invitation] = await db
      .insert(workspaceInvitations)
      .values({
        id: v7(),
        workspaceId: input.workspaceId,
        email: input.email,
        token: input.token,
        expiresAt: input.expiresAt,
        createdBy: input.createdBy,
      })
      .returning();

    return invitation;
  }

  async findByToken(token: string) {
    const [invitation] = await db
      .select()
      .from(workspaceInvitations)
      .where(eq(workspaceInvitations.token, token));

    return invitation ?? null;
  }

  async findValidInvitation(token: string) {
    const now = new Date();

    const [invitation] = await db
      .select()
      .from(workspaceInvitations)
      .where(
        and(
          eq(workspaceInvitations.token, token),
          gt(workspaceInvitations.expiresAt, now),
          isNull(workspaceInvitations.acceptedAt),
        ),
      );

    return invitation ?? null;
  }

  async markAccepted(invitationId: string) {
    const [invitation] = await db
      .update(workspaceInvitations)
      .set({ acceptedAt: new Date() })
      .where(eq(workspaceInvitations.id, invitationId))
      .returning();

    return invitation;
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

  async findExistingMembership(input: { workspaceId: string; userId: string }) {
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
}
