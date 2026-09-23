/**
 * Prints an HTML document with the browser's own print dialog.
 * Used when QZ Tray is not available. Kept separate from qzPrinter.ts so it works even
 * when the qz-tray package cannot be loaded.
 *
 * Hidden, sandboxed iframe: the HTML is printed and its own scripts never run.
 */
export function printWithBrowser(html: string): void {
  const frame = document.createElement('iframe');
  frame.setAttribute('aria-hidden', 'true');
  frame.setAttribute('tabindex', '-1');
  frame.setAttribute('sandbox', 'allow-same-origin allow-modals');
  frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
  frame.onload = () => {
    window.setTimeout(() => {
      try {
        frame.contentWindow?.focus();
        frame.contentWindow?.print();
      } finally {
        window.setTimeout(() => frame.remove(), 1000);
      }
    }, 250);
  };
  frame.srcdoc = html;
  document.body.appendChild(frame);
}
