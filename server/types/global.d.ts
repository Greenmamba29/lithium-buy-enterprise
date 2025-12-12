// Type declarations for modules without type definitions

declare module 'nodemailer' {
  export interface TransportOptions {
    host?: string;
    port?: number;
    secure?: boolean;
    auth?: {
      user: string;
      pass: string;
    };
  }

  export interface MailOptions {
    from?: string;
    to: string;
    subject: string;
    html?: string;
    text?: string;
  }

  export interface Transporter {
    sendMail(options: MailOptions): Promise<any>;
  }

  export function createTransport(options: TransportOptions): Transporter;
  export default { createTransport };
}
