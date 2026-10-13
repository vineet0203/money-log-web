/**
 * Utility for printing POS thermal receipts.
 * Clones the receipt element into an isolated iframe with dedicated print styles,
 * preventing browser modals, dark backdrops, or page backgrounds from polluting the printout.
 */

export function printThermalReceipt(elementId: string = 'pos-thermal-receipt') {
  if (typeof window === 'undefined') return;

  const sourceEl = document.getElementById(elementId);
  if (!sourceEl) {
    console.warn(`Receipt element with id "${elementId}" not found for printing.`);
    window.print();
    return;
  }

  // Remove existing print iframe if any
  const existingFrame = document.getElementById('pos-print-iframe');
  if (existingFrame) {
    existingFrame.remove();
  }

  // Create an iframe positioned off-screen with concrete dimensions so Chromium layout engine doesn't produce blank pages
  const iframe = document.createElement('iframe');
  iframe.id = 'pos-print-iframe';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.top = '-9999px';
  iframe.style.width = '80mm';
  iframe.style.height = '1200px';
  iframe.style.border = '0';
  iframe.style.opacity = '1';
  iframe.style.zIndex = '-9999';
  iframe.style.pointerEvents = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  // Grab existing stylesheet links and style tags to preserve Tailwind styles
  const styleElements = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
    .map(el => el.outerHTML)
    .join('\n');

  // Clone content and remove any no-print elements inside
  const cloned = sourceEl.cloneNode(true) as HTMLElement;
  cloned.querySelectorAll('.no-print, [data-no-print="true"], button').forEach(el => el.remove());

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Receipt</title>
        ${styleElements}
        <style>
          @page {
            size: 80mm auto;
            margin: 0mm;
          }
          *, *::before, *::after {
            visibility: visible !important;
            opacity: 1 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            background: #ffffff !important;
            color: #000000 !important;
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          }
          body {
            display: flex !important;
            justify-content: center !important;
            align-items: flex-start !important;
            padding: 2mm 1mm !important;
          }
          #${elementId}, .pos-receipt-printable {
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 80mm !important;
            padding: 2px !important;
            background: #ffffff !important;
            color: #000000 !important;
            visibility: visible !important;
            display: flex !important;
          }

          /* Prevent cards, tables, rows, or QR blocks from being sliced across pages */
          div, p, tr, table, img, svg, .pos-receipt-printable > div {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }

          /* High contrast solid monochrome text */
          h1, h2, h3, h4, p, span, div, td, th {
            color: #000000 !important;
            visibility: visible !important;
          }
          .no-print, [data-no-print="true"], button {
            display: none !important;
          }
        </style>
      </head>
      <body>
        ${cloned.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.error('Iframe print error:', err);
      window.print();
    } finally {
      setTimeout(() => {
        iframe.remove();
      }, 3000);
    }
  };

  // Wait for images inside iframe to finish loading if any, or trigger after short timeout
  const images = iframe.contentWindow?.document?.images;
  if (images && images.length > 0) {
    let pending = images.length;
    const onImgFinish = () => {
      pending--;
      if (pending <= 0) {
        setTimeout(triggerPrint, 150);
      }
    };
    for (let i = 0; i < images.length; i++) {
      if (images[i].complete) {
        pending--;
      } else {
        images[i].onload = onImgFinish;
        images[i].onerror = onImgFinish;
      }
    }
    if (pending <= 0) {
      setTimeout(triggerPrint, 350);
    } else {
      setTimeout(triggerPrint, 1200); // safety fallback timeout
    }
  } else {
    setTimeout(triggerPrint, 350);
  }
}
