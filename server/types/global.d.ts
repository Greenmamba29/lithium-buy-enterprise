// Global type declarations for server packages without TypeScript definitions

// nodemailer types are provided by @types/nodemailer, but this serves as a fallback
declare module 'nodemailer' {
  export function createTransport(options: any): any;
  export namespace transports {
    export class SMTP {
      constructor(options: any);
    }
  }
}

