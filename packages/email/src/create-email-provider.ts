import type { EmailProvider } from './email-provider';
import { SendGridEmailProvider } from './sendgrid-provider';

export function createEmailProvider(
  provider: string,
  config: Record<string, unknown>,
): EmailProvider {
  switch (provider) {
    case 'sendgrid': {
      const apiKey = config.apiKey as string;
      if (!apiKey) {
        throw new Error('SendGrid provider requires apiKey in providerConfig');
      }
      return new SendGridEmailProvider({ apiKey });
    }
    default:
      throw new Error(`Unsupported email provider: ${provider}`);
  }
}
