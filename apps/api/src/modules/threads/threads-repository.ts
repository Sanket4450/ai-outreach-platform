import { Injectable } from '@nestjs/common';
import { eq, and, sql } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { threads } from '@repo/db';
import type { ThreadStatus } from '@repo/types';

@Injectable()
export class ThreadsRepository {
  async createThread(input: {
    workspaceId: string;
    contactId: string;
    senderId: string;
    status: ThreadStatus;
  }) {
    const [thread] = await db
      .insert(threads)
      .values({
        id: v7(),
        workspaceId: input.workspaceId,
        contactId: input.contactId,
        senderId: input.senderId,
        status: input.status,
      })
      .returning();

    return thread;
  }

  async findById(id: string) {
    const [thread] = await db.select().from(threads).where(eq(threads.id, id));

    return thread ?? null;
  }

  async findExistingThread(workspaceId: string, contactId: string, senderId: string) {
    const [thread] = await db
      .select()
      .from(threads)
      .where(
        and(
          eq(threads.workspaceId, workspaceId),
          eq(threads.contactId, contactId),
          eq(threads.senderId, senderId),
        ),
      );

    return thread ?? null;
  }

  async findManyByWorkspace(
    workspaceId: string,
    filters: { status?: ThreadStatus; page: number; pageSize: number },
  ) {
    const conditions: ReturnType<typeof and>[] = [eq(threads.workspaceId, workspaceId)];

    if (filters.status) {
      conditions.push(eq(threads.status, filters.status));
    }

    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(threads)
        .where(and(...conditions))
        .orderBy(sql`${threads.lastMessageAt} DESC NULLS LAST, ${threads.createdAt} DESC`)
        .limit(filters.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(threads)
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

  async updateStatus(id: string, status: ThreadStatus) {
    const [thread] = await db.update(threads).set({ status }).where(eq(threads.id, id)).returning();

    return thread;
  }

  async updateLastMessageAt(id: string, lastMessageAt: Date) {
    const [thread] = await db
      .update(threads)
      .set({ lastMessageAt })
      .where(eq(threads.id, id))
      .returning();

    return thread;
  }
}
