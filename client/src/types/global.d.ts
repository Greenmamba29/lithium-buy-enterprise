import '@testing-library/jest-dom';

// Global type declarations for packages without TypeScript definitions

declare module '@daily-co/daily-js' {
  export class DailyIframe {
    static createFrame(container: HTMLElement, options?: any): any;
    on(event: string, callback: (data?: any) => void): void;
    join(config: any): Promise<void>;
    setLocalVideo(enabled: boolean): Promise<void>;
    setLocalAudio(enabled: boolean): Promise<void>;
    startScreenShare(): Promise<void>;
    stopScreenShare(): Promise<void>;
    leave(): Promise<void>;
    destroy(): Promise<void>;
  }
}
