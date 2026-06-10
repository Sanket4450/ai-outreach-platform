import type { EmailProvider, SendEmailInput, SendEmailResult } from './email-provider';

export type SendGridConfig = {
  apiKey: string;
};

export class SendGridEmailProvider implements EmailProvider {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: SendGridConfig) {
    this.apiKey = config.apiKey;
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const payload = {
      personalizations: [
        {
          to: [{ email: input.toEmail, name: input.toName }],
          subject: input.subject,
        },
      ],
      from: {
        email: input.fromEmail,
        name: input.fromName,
      },
      content: [
        {
          type: 'text/html',
          value: input.body,
        },
      ],
    };

    const response = await fetch(`${this.baseUrl}/mail/send`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`SendGrid delivery failed: ${response.status} ${body}`);
    }

    const messageId = response.headers.get('x-message-id');

    if (!messageId) {
      throw new Error('SendGrid response missing x-message-id header');
    }

    return { providerMessageId: messageId };
  }
}
