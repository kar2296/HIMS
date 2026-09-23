/**
 * Direct printing to the local barcode-label and dot-matrix printers through QZ Tray
 * (npm "qz-tray" 2.3; the QZ Tray desktop app must be installed and running on the PC).
 *
 * - Connects only when something is printed (no websocket attempts while pages load).
 * - Requests are signed by the API (General/QzPrint/*) when a certificate is configured there;
 *   the private key never reaches the browser. Without one, QZ Tray asks once per PC to allow the site.
 * - HTML prints fall back to the browser print dialog when QZ Tray is not running.
 *
 * Loaded on the first print by himsPrint.ts, which exposes window.HimsPrint to AngularJS.
 */
import qz from 'qz-tray';
import type { QzPrintItem } from 'qz-tray';
import { apiFetch } from '../react-components/utils/api';
import { printWithBrowser } from './browserPrint';

export type PrinterKind = 'barcode' | 'dotmatrix';

export interface PrintOptions {
  /** Which local printer to use when no explicit printer is given. Default: 'barcode'. */
  kind?: PrinterKind;
  /** Exact printer name as shown by the operating system. */
  printer?: string;
  copies?: number;
}

/** Printer names the previous QZ integration fell back to when the PC has no default printer. */
const FALLBACK_PRINTER: Record<PrinterKind, string> = {
  barcode: 'ZDesigner GC420t (EPL) (Copy 1)',
  dotmatrix: 'TVS MSP 240 Star',
};
const SAVED_PRINTER_KEY = 'hims.printer.';
const NOT_RUNNING_MESSAGE = 'QZ Tray is not running on this computer. Start QZ Tray and try printing again.';

export class QzUnavailableError extends Error {
  constructor() {
    super(NOT_RUNNING_MESSAGE);
    this.name = 'QzUnavailableError';
  }
}

let securityConfigured = false;
let signingEnabled = false;
let connecting: Promise<void> | null = null;
let defaultPrinter: string | null | undefined;

function configureSecurity(): void {
  if (securityConfigured) return;
  securityConfigured = true;

  qz.security.setCertificatePromise((resolve) => {
    apiFetch('General/QzPrint/Certificate', {})
      .then((res) => {
        signingEnabled = Boolean(res?.Certificate);
        resolve(res?.Certificate || null);
      })
      // An API without the signing route (or offline) still allows unsigned printing.
      .catch(() => {
        signingEnabled = false;
        resolve(null);
      });
  });
  qz.security.setSignatureAlgorithm('SHA512');
  qz.security.setSignaturePromise((toSign) => (resolve, reject) => {
    if (!signingEnabled) {
      resolve();
      return;
    }
    apiFetch('General/QzPrint/Sign', { Data: { ToSign: toSign } })
      .then((res) => resolve(res?.Signature))
      .catch(reject);
  });
}

async function connect(): Promise<void> {
  configureSecurity();
  if (qz.websocket.isActive()) return;
  // Several prints can be started at once: they share one connection attempt.
  connecting ??= qz.websocket
    .connect({ retries: 1, delay: 1 })
    .catch(() => {
      throw new QzUnavailableError();
    })
    .finally(() => {
      connecting = null;
    });
  await connecting;
}

function readSavedPrinter(kind: PrinterKind): string | null {
  try {
    return localStorage.getItem(SAVED_PRINTER_KEY + kind);
  } catch {
    return null;
  }
}

async function resolvePrinter(kind: PrinterKind, explicit?: string): Promise<string> {
  if (explicit) return explicit;
  const saved = readSavedPrinter(kind);
  if (saved) return saved;
  if (defaultPrinter === undefined) {
    defaultPrinter = await qz.printers.getDefault().catch(() => null);
  }
  return defaultPrinter || FALLBACK_PRINTER[kind];
}

async function send(data: Array<string | QzPrintItem>, options: PrintOptions): Promise<void> {
  await connect();
  const printer = await resolvePrinter(options.kind || 'barcode', options.printer);
  await qz.print(qz.configs.create(printer, { copies: Math.max(1, options.copies || 1) }), data);
}

/**
 * Sends raw printer commands (EPL/ZPL for label printers, ESC/P text for dot-matrix printers).
 * Accepts the same data the legacy screens build: an array of command strings (or QZ print objects).
 */
export async function printRaw(data: unknown, options: PrintOptions = {}): Promise<void> {
  const items = (Array.isArray(data) ? data : [data]).filter(
    (item): item is string | QzPrintItem => (typeof item === 'string' && item.length > 0) || (typeof item === 'object' && item !== null),
  );
  if (items.length === 0) throw new Error('Nothing to print.');
  await send(items, options);
}

/** Prints an HTML document. Uses QZ Tray when it is running, otherwise the browser print dialog. */
export async function printHtml(html: unknown, options: PrintOptions = {}): Promise<void> {
  if (typeof html !== 'string' || !html.trim()) throw new Error('Nothing to print.');
  try {
    await send([{ type: 'pixel', format: 'html', flavor: 'plain', data: html }], options);
  } catch (err) {
    if (err instanceof QzUnavailableError) {
      printWithBrowser(html);
      return;
    }
    throw err;
  }
}

/** Remembers which installed printer to use for a kind on this PC (e.g. from a settings screen). */
export function setPrinter(kind: PrinterKind, printerName: string | null): void {
  try {
    if (printerName) localStorage.setItem(SAVED_PRINTER_KEY + kind, printerName);
    else localStorage.removeItem(SAVED_PRINTER_KEY + kind);
  } catch {
    /* storage unavailable (private mode): the default printer is used */
  }
}

/** Names of the printers installed on this PC (requires QZ Tray). */
export async function listPrinters(): Promise<string[]> {
  await connect();
  const found = await qz.printers.find();
  return Array.isArray(found) ? found : [found];
}
