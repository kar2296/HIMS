/**
 * Minimal typings for the parts of the "qz-tray" package (2.x) used by qzPrinter.ts.
 * The package ships without TypeScript declarations.
 */
declare module 'qz-tray' {
  type Resolver<T> = (resolve: (value?: T) => void, reject: (reason?: unknown) => void) => void;

  export interface QzPrintConfig {
    readonly printer: string;
  }

  export interface QzPrintItem {
    type: 'raw' | 'pixel';
    format: 'command' | 'html' | 'pdf' | 'image';
    flavor?: 'plain' | 'file' | 'base64';
    data: string;
  }

  interface Qz {
    websocket: {
      isActive(): boolean;
      connect(options?: { retries?: number; delay?: number }): Promise<void>;
      disconnect(): Promise<void>;
    };
    printers: {
      getDefault(): Promise<string | null>;
      find(query?: string): Promise<string | string[]>;
    };
    configs: {
      create(printer: string, options?: { copies?: number; jobName?: string }): QzPrintConfig;
    };
    security: {
      setCertificatePromise(handler: Resolver<string | null>): void;
      setSignatureAlgorithm(algorithm: 'SHA1' | 'SHA256' | 'SHA512'): void;
      setSignaturePromise(factory: (toSign: string) => Resolver<string>): void;
    };
    print(config: QzPrintConfig, data: Array<string | QzPrintItem>): Promise<void>;
  }

  const qz: Qz;
  export default qz;
}
