import { Injectable } from '@nestjs/common';
import { eq, and, gt, isNull } from 'drizzle-orm';
import { v7 } from 'uuid';
import { db } from '../../config/db';
import { emailVerifications } from '@repo/db';

@Injectable()
export class OtpRepository {
  async create(input: { email: string; otp: string; expiresAt: Date }) {
    const [record] = await db
      .insert(emailVerifications)
      .values({
        id: v7(),
        email: input.email,
        otp: input.otp,
        expiresAt: input.expiresAt,
      })
      .returning();

    return record;
  }

  async findValidOtp(input: { email: string; otp: string }) {
    const now = new Date();

    const [record] = await db
      .select()
      .from(emailVerifications)
      .where(
        and(
          eq(emailVerifications.email, input.email),
          eq(emailVerifications.otp, input.otp),
          gt(emailVerifications.expiresAt, now),
        ),
      );

    return record ?? null;
  }

  async invalidateByEmail(email: string) {
    await db.delete(emailVerifications).where(eq(emailVerifications.email, email));
  }
}
