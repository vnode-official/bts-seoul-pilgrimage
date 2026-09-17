export {};

interface LemonJsEvent {
  event: string;
  data?: unknown;
}

interface LemonJsApi {
  Setup: (options: { eventHandler: (event: LemonJsEvent) => void }) => void;
  Refresh: () => void;
  Url: {
    Open: (url: string) => void;
    Close: () => void;
  };
}

declare global {
  interface Window {
    createLemonSqueezy?: () => void;
    LemonSqueezy?: LemonJsApi;
  }
}
