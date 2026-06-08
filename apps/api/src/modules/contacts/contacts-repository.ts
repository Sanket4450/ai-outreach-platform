import { Injectable } from '@nestjs/common';
import { eq, and, isNull, or, like, sql } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { contacts } from '@repo/db';
import type { CreateContactInput, UpdateContactInput, ListContactsQuery } from '@repo/shared';

@Injectable()
export class ContactsRepository {
  async createContact(input: CreateContactInput & { workspaceId: string }) {
    const [contact] = await db
      .insert(contacts)
      .values({
        id: v7(),
        workspaceId: input.workspaceId,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        company: input.company,
        title: input.title,
        linkedinUrl: input.linkedinUrl,
        notes: input.notes,
      })
      .returning();

    return contact;
  }

  async findById(id: string) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, id));

    return contact ?? null;
  }

  async findActiveById(id: string) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(and(eq(contacts.id, id), isNull(contacts.deletedAt)));

    return contact ?? null;
  }

  async findByEmailInWorkspace(workspaceId: string, email: string) {
    const [contact] = await db
      .select()
      .from(contacts)
      .where(
        and(eq(contacts.workspaceId, workspaceId), eq(contacts.email, email), isNull(contacts.deletedAt)),
      );

    return contact ?? null;
  }

  async findManyByWorkspace(
    workspaceId: string,
    query: ListContactsQuery,
  ) {
    const conditions: ReturnType<typeof and>[] = [
      eq(contacts.workspaceId, workspaceId),
      isNull(contacts.deletedAt),
    ];

    if (query.search) {
      const searchTerm = `%${query.search}%`;
      conditions.push(
        or(
          like(contacts.email, searchTerm),
          like(contacts.firstName, searchTerm),
          like(contacts.lastName, searchTerm),
          like(contacts.company, searchTerm),
        ),
      );
    }

    const offset = (query.page - 1) * query.pageSize;

    const [rows, countResult] = await Promise.all([
      db
        .select()
        .from(contacts)
        .where(and(...conditions))
        .orderBy(contacts.createdAt)
        .limit(query.pageSize)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(contacts)
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

  async updateContact(id: string, input: UpdateContactInput) {
    const setData: Record<string, unknown> = {};

    if (input.email !== undefined) setData.email = input.email;
    if (input.firstName !== undefined) setData.firstName = input.firstName;
    if (input.lastName !== undefined) setData.lastName = input.lastName;
    if (input.company !== undefined) setData.company = input.company;
    if (input.title !== undefined) setData.title = input.title;
    if (input.linkedinUrl !== undefined) setData.linkedinUrl = input.linkedinUrl || null;
    if (input.notes !== undefined) setData.notes = input.notes;

    const [contact] = await db
      .update(contacts)
      .set(setData)
      .where(eq(contacts.id, id))
      .returning();

    return contact;
  }

  async softDelete(id: string) {
    const [contact] = await db
      .update(contacts)
      .set({ deletedAt: new Date() })
      .where(eq(contacts.id, id))
      .returning();

    return contact;
  }
}