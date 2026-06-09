import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { drafts } from '@repo/db';
import type { DraftStatus } from '@repo/shared';
import type { UpdateDraftInput } from '@repo/shared';

@Injectable()
export class DraftsRepository {
  async createDraft(workspaceId: string) {
    const [draft] = await db
      .insert(drafts)
      .values({
        id: v7(),
        workspaceId,
        subject: '',
        body: '',
        status: 'generated',
      })
      .returning();

    return draft;
  }

  async findById(id: string) {
    const [draft] = await db
      .select()
      .from(drafts)
      .where(eq(drafts.id, id));

    return draft ?? null;
  }

  async findManyByWorkspace(
    workspaceId: string,
    filters: { status?: DraftStatus; page: number; pageSize: number },
  ) {
    const conditions: ReturnType<typeof and>[] = [
      eq(drafts.workspaceId, workspaceId),
    ];

    if (filters.status) {
      conditions.push(eq(drafts.status, filters.status));
    }

    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(drafts)
        .where(and(...conditions))
        .orderBy(sql`${drafts.updatedAt} DESC`)
        .limit(filters.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(drafts)
        .where(and(...conditions)),
    ]);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / filters.pageSize);

    return {
      data: rows,
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages,
    };
  }

  async updateDraft(id: string, input: UpdateDraftInput & { status?: DraftStatus }) {
    const setData: Record<string, unknown> = {};

    if (input.subject !== undefined) setData.subject = input.subject;
    if (input.body !== undefined) setData.body = input.body;
    if (input.contactId !== undefined) setData.contactId = input.contactId || null;
    if (input.senderId !== undefined) setData.senderId = input.senderId || null;
    if (input.status !== undefined) setData.status = input.status;

    const [draft] = await db
      .update(drafts)
      .set(setData)
      .where(eq(drafts.id, id))
      .returning();

    return draft;
  }

  async updateStatus(id: string, status: DraftStatus) {
    const [draft] = await db
      .update(drafts)
      .set({ status })
      .where(eq(drafts.id, id))
      .returning();

    return draft;
  }

  async linkToThread(id: string, threadId: string) {
    const [draft] = await db
      .update(drafts)
      .set({ threadId })
      .where(eq(drafts.id, id))
      .returning();

    return draft;
  }
}