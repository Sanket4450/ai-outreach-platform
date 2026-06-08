import { Injectable } from '@nestjs/common';
import { eq, and, sql, isNull } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { messages } from '@repo/db';
import type { MessageDirection, MessageStatus } from '@repo/shared';

@Injectable()
export class MessagesRepository {
  async createMessage(input: {
    workspaceId: string;
    threadId: string;
    direction: MessageDirection;
    status: MessageStatus;
    fromEmail: string;
    toEmail: string;
    fromName?: string;
    toName?: string;
    subject: string;
    body: string;
    scheduledFor?: Date | null;
  }) {
    const [message] = await db
      .insert(messages)
      .values({
        id: v7(),
        workspaceId: input.workspaceId,
        threadId: input.threadId,
        direction: input.direction,
        status: input.status,
        fromEmail: input.fromEmail,
        toEmail: input.toEmail,
        fromName: input.fromName,
        toName: input.toName,
        subject: input.subject,
        body: input.body,
        scheduledFor: input.scheduledFor,
      })
      .returning();

    return message;
  }

  async findById(id: string) {
    const [message] = await db
      .select()
      .from(messages)
      .where(and(eq(messages.id, id), isNull(messages.deletedAt)));

    return message ?? null;
  }

  async findManyByThreadId(
    threadId: string,
    filters: { page: number; pageSize: number },
  ) {
    const conditions: ReturnType<typeof and>[] = [
      eq(messages.threadId, threadId),
      isNull(messages.deletedAt),
    ];

    const offset = (filters.page - 1) * filters.pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(messages)
        .where(and(...conditions))
        .orderBy(messages.createdAt)
        .limit(filters.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
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

  async updateStatus(id: string, status: MessageStatus) {
    const [message] = await db
      .update(messages)
      .set({ status })
      .where(eq(messages.id, id))
      .returning();

    return message;
  }

  async markSent(id: string, sentAt: Date) {
    const [message] = await db
      .update(messages)
      .set({ status: 'sent', sentAt })
      .where(and(eq(messages.id, id), eq(messages.status, 'queued')))
      .returning();

    return message;
  }

  async markDelivered(id: string, deliveredAt: Date) {
    const [message] = await db
      .update(messages)
      .set({ deliveredAt })
      .where(eq(messages.id, id))
      .returning();

    return message;
  }

  async markOpened(id: string, firstOpenedAt: Date) {
    const [message] = await db
      .update(messages)
      .set({ firstOpenedAt })
      .where(
        and(eq(messages.id, id), isNull(messages.firstOpenedAt)),
      )
      .returning();

    return message;
  }

  async markClicked(id: string, firstClickedAt: Date) {
    const [message] = await db
      .update(messages)
      .set({ firstClickedAt })
      .where(
        and(eq(messages.id, id), isNull(messages.firstClickedAt)),
      )
      .returning();

    return message;
  }

  async markBounced(id: string, bouncedAt: Date) {
    const [message] = await db
      .update(messages)
      .set({ status: 'failed', bouncedAt })
      .where(eq(messages.id, id))
      .returning();

    return message;
  }
}