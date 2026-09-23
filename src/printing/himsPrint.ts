/**
 * window.HimsPrint: the print API used by the AngularJS print controllers
 * (public/views/common/barcodeprintcontroller.js).
 *
 * QZ Tray support (qzPrinter.ts + the qz-tray package) is loaded on the first print only, so pages
 * do not download it up front and the app still starts if the package is missing. In that case raw
 * (barcode / dot-matrix) prints report the problem and HTML prints use the browser print dialog.
 */
import type { PrinterKind, PrintOptions } from './qzPrinter';
import { printWithBrowser } from './browserPrint';

type QzPrinterModule = typeof import('./qzPrinter');

let loading: Promise<QzPrinterModule> | null = null;

function loadQzPrinter(): Promise<QzPrinterModule> {
  loading ??= import('./qzPrinter').catch((err: unknown) => {
    loading = null; // allow a retry, e.g. after the package is installed and the page reloaded
    console.error('QZ Tray printing could not be loaded', err);
    throw new Error('Direct printing is not available (QZ Tray module could not be loaded). Please reload the page or contact support.');
  });
  return loading;
}

export const HimsPrint = {
  async printRaw(data: unknown, options?: PrintOptions): Promise<void> {
    return (await loadQzPrinter()).printRaw(data, options);
  },
  async printHtml(html: unknown, options?: PrintOptions): Promise<void> {
    let qzPrinter: QzPrinterModule;
    try {
      qzPrinter = await loadQzPrinter();
    } catch {
      if (typeof html !== 'string' || !html.trim()) throw new Error('Nothing to print.');
      printWithBrowser(html);
      return;
    }
    return qzPrinter.printHtml(html, options);
  },
  async setPrinter(kind: PrinterKind, printerName: string | null): Promise<void> {
    (await loadQzPrinter()).setPrinter(kind, printerName);
  },
  async listPrinters(): Promise<string[]> {
    return (await loadQzPrinter()).listPrinters();
  },
};

declare global {
  interface Window {
    HimsPrint?: typeof HimsPrint;
  }
}

window.HimsPrint = HimsPrint;
