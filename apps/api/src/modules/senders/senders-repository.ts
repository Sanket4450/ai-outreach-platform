import { Injectable } from '@nestjs/common';
import { eq, and, or, like, sql, ne } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '@/config/db';
import { senders, threads } from '@repo/db';
import type { CreateSenderInput, UpdateSenderInput, ListSendersQuery } from '@repo/shared';

@Injectable()
export class SendersRepository {
  async createSender(input: CreateSenderInput & { workspaceId: string }) {
    const [sender] = await db
      .insert(senders)
      .values({
        id: v7(),
        workspaceId: input.workspaceId,
        name: input.name,
        email: input.email,
        provider: input.provider,
        providerConfig: input.providerConfig,
      })
      .returning();

    return sender;
  }

  async findById(id: string) {
    const [sender] = await db.select().from(senders).where(eq(senders.id, id));

    return sender ?? null;
  }

  async findByEmailAndProviderInWorkspace(workspaceId: string, email: string, provider: string) {
    const [sender] = await db
      .select()
      .from(senders)
      .where(
        and(
          eq(senders.workspaceId, workspaceId),
          eq(senders.email, email),
          eq(senders.provider, provider),
        ),
      );

    return sender ?? null;
  }

  async findManyByWorkspace(workspaceId: string, query: ListSendersQuery) {
    const conditions: ReturnType<typeof and>[] = [eq(senders.workspaceId, workspaceId)];

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      conditions.push(
        or(
          like(senders.name, searchTerm),
          like(senders.email, searchTerm),
          like(senders.provider, searchTerm),
        ),
      );
    }

    const offset = (query.page - 1) * query.pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(senders)
        .where(and(...conditions))
        .orderBy(senders.createdAt)
        .limit(query.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(senders)
        .where(and(...conditions)),
    ]);

    const total = countResult[0]?.count ?? 0;
    const totalPages = Math.ceil(total / query.pageSize);

    return {
      data: rows,
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages,
    };
  }

  async updateSender(id: string, input: UpdateSenderInput) {
    const setData: Record<string, unknown> = {};

    if (input.name !== undefined) setData.name = input.name;
    if (input.email !== undefined) setData.email = input.email;
    if (input.provider !== undefined) setData.provider = input.provider;
    if (input.providerConfig !== undefined) setData.providerConfig = input.providerConfig;

    const [sender] = await db.update(senders).set(setData).where(eq(senders.id, id)).returning();

    return sender;
  }

  async deleteById(id: string) {
    const [sender] = await db.delete(senders).where(eq(senders.id, id)).returning();

    return sender;
  }

  async hasActiveThreads(senderId: string) {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(threads)
      .where(and(eq(threads.senderId, senderId), ne(threads.status, 'closed')));

    return (row?.count ?? 0) > 0;
  }
}
