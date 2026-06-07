import { Injectable } from '@nestjs/common';
import { eq, and, isNull } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { users } from '@repo/db';

@Injectable()
export class AuthRepository {
  async findUserByEmail(email: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)));

    return user ?? null;
  }

  async createUser(input: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName?: string | null;
  }) {
    const [user] = await db
      .insert(users)
      .values({
        id: v7(),
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName ?? null,
      })
      .returning();

    return user;
  }

  async verifyUserEmail(userId: string) {
    const [user] = await db
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.id, userId))
      .returning();

    return user;
  }
}
