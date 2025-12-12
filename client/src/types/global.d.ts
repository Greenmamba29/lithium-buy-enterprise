// Type declarations for modules without type definitions

declare module '@daily-co/daily-js' {
  export interface DailyCallOptions {
    url?: string;
    token?: string;
    showLeaveButton?: boolean;
    iframeStyle?: {
      position?: string;
      width?: string;
      height?: string;
      border?: string;
    };
  }

  export interface DailyCall {
    join(options: { url: string; token?: string }): Promise<void>;
    leave(): Promise<void>;
    destroy(): Promise<void>;
    setLocalVideo(enabled: boolean): Promise<void>;
    setLocalAudio(enabled: boolean): Promise<void>;
    startScreenShare(): Promise<void>;
    stopScreenShare(): Promise<void>;
    on(event: string, callback: (e: any) => void): void;
    off(event: string, callback: (e: any) => void): void;
  }

  export interface DailyIframeType {
    createFrame(container: HTMLElement, options?: DailyCallOptions): DailyCall;
  }

  export const DailyIframe: DailyIframeType;
  export default DailyIframe;
}
