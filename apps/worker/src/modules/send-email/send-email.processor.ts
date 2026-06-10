import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { eq } from 'drizzle-orm';
import { messages, threads, senders, contacts } from '@repo/db';
import { createEmailProvider } from '@repo/email';
import type { SendEmailJob } from '@repo/types';
import { db } from '@/config/db';

@Processor('email')
export class SendEmailProcessor extends WorkerHost {
  async process(job: Job<SendEmailJob, void, 'send-email'>): Promise<void> {
    const { workspaceId, messageId } = job.data;

    const logger = {
      info: (ctx: Record<string, unknown>) =>
        console.log(JSON.stringify({ level: 'info', ...ctx })),
      error: (ctx: Record<string, unknown>) =>
        console.error(JSON.stringify({ level: 'error', ...ctx })),
    };

    logger.info({ workspaceId, messageId, jobId: job.id });

    // 1. Resolve message
    const [message] = await db.select().from(messages).where(eq(messages.id, messageId));

    if (!message) {
      logger.error({ workspaceId, messageId, error: 'Message not found' });
      return;
    }

    // 2. Resolve thread
    const [thread] = await db.select().from(threads).where(eq(threads.id, message.threadId));

    if (!thread) {
      logger.error({
        workspaceId,
        messageId,
        threadId: message.threadId,
        error: 'Thread not found',
      });
      return;
    }

    // 3. Resolve sender
    const [sender] = await db.select().from(senders).where(eq(senders.id, thread.senderId));

    if (!sender) {
      logger.error({
        workspaceId,
        messageId,
        senderId: thread.senderId,
        error: 'Sender not found',
      });
      return;
    }

    // 4. Resolve contact
    const [contact] = await db.select().from(contacts).where(eq(contacts.id, thread.contactId));

    if (!contact) {
      logger.error({
        workspaceId,
        messageId,
        contactId: thread.contactId,
        error: 'Contact not found',
      });
      return;
    }

    // 5. Build provider payload & resolve provider from sender config
    const toName = `${contact.firstName ?? ''} ${contact.lastName ?? ''}`.trim() || undefined;
    const provider = createEmailProvider(
      sender.provider,
      (sender.providerConfig as Record<string, unknown>) ?? {},
    );

    // 6. Call email provider
    try {
      const result = await provider.send({
        fromEmail: message.fromEmail,
        fromName: message.fromName ?? undefined,
        toEmail: message.toEmail,
        toName,
        subject: message.subject,
        body: message.body,
      });

      // 7. Receive provider response - update message
      // 8. Update message with providerMessageId and set status to sent
      await db
        .update(messages)
        .set({
          providerMessageId: result.providerMessageId,
          status: 'sent',
          sentAt: new Date(),
        })
        .where(eq(messages.id, messageId));

      logger.info({
        workspaceId,
        messageId,
        threadId: thread.id,
        providerMessageId: result.providerMessageId,
        status: 'sent',
      });
    } catch (error) {
      // Failure flow: update message status to failed
      await db.update(messages).set({ status: 'failed' }).where(eq(messages.id, messageId));

      const errorMessage = error instanceof Error ? error.message : String(error);

      logger.error({
        workspaceId,
        messageId,
        threadId: thread.id,
        error: errorMessage,
        status: 'failed',
      });

      throw error;
    }
  }
}
