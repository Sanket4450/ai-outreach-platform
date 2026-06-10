export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}

export type SendEmailInput = {
  fromEmail: string;
  fromName?: string;

  toEmail: string;
  toName?: string;

  subject: string;
  body: string;
};

export type SendEmailResult = {
  providerMessageId: string;
};
