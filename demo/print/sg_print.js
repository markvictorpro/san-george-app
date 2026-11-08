// Phone printing for San George.
//
// Phone browsers cannot show a PDF inside a page, and they block a PDF tab
// opened a few seconds after a tap. So the app renders the PDF pages to
// images with pdf.js (bundled in ../pdfjs/, cached for offline use), shows
// them as a preview, and prints them with window.print() straight from the
// user's tap. The images live in a hidden #sg-print-root that is the only
// thing visible when printing.

const MAX_CANVAS_PIXELS = 16000000; // iOS refuses bigger canvases.
const ROOT_ID = 'sg-print-root';
const STYLE_ID = 'sg-print-style';

let pdfjsPromise = null;
let urls = [];
let pdfUrl = null;

function asset(path) {
  return new URL(path, document.baseURI).href;
}

function loadPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import(asset('pdfjs/pdf.min.mjs'))
      .then((pdfjs) => {
        pdfjs.GlobalWorkerOptions.workerSrc = asset('pdfjs/pdf.worker.min.mjs');
        return pdfjs;
      })
      .catch((error) => {
        pdfjsPromise = null; // Try again next time (e.g. back online).
        throw error;
      });
  }
  return pdfjsPromise;
}

function clear() {
  document.getElementById(ROOT_ID)?.remove();
  document.getElementById(STYLE_ID)?.remove();
  for (const url of urls) URL.revokeObjectURL(url);
  urls = [];
  if (pdfUrl) URL.revokeObjectURL(pdfUrl);
  pdfUrl = null;
}

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))),
      'image/png',
    );
  });
}

function pointsToMm(points) {
  return (points * 25.4) / 72;
}

// Keeps a link to the PDF itself so openPdf() works even if rendering fails.
function keepPdf(bytes) {
  clear();
  pdfUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));
}

async function renderPages(bytes, dpi) {
  const pdfjs = await loadPdfjs();
  const task = pdfjs.getDocument({ data: bytes.slice() });
  const doc = await task.promise;
  const pages = [];
  try {
    for (let number = 1; number <= doc.numPages; number++) {
      const page = await doc.getPage(number);
      const base = page.getViewport({ scale: 1 });
      let scale = dpi / 72;
      const pixels = base.width * scale * base.height * scale;
      if (pixels > MAX_CANVAS_PIXELS) {
        scale *= Math.sqrt(MAX_CANVAS_PIXELS / pixels);
      }
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      await page.render({ canvasContext: context, canvas, viewport }).promise;
      const url = URL.createObjectURL(await canvasToBlob(canvas));
      urls.push(url);
      pages.push({
        url,
        widthMm: pointsToMm(base.width),
        heightMm: pointsToMm(base.height),
      });
      canvas.width = 0; // Free the canvas memory right away.
      canvas.height = 0;
      page.cleanup();
    }
  } finally {
    task.destroy();
  }
  return pages;
}

async function buildPrintRoot(pages) {
  const first = pages[0];
  const width = first.widthMm.toFixed(2);
  const height = first.heightMm.toFixed(2);
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    @media screen {
      #${ROOT_ID} { display: none !important; }
    }
    @media print {
      @page { size: ${width}mm ${height}mm; margin: 0; }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        position: static !important;
        overflow: visible !important;
        height: auto !important;
        background: #fff !important;
      }
      body > *:not(#${ROOT_ID}) { display: none !important; }
      #${ROOT_ID} { display: block !important; }
      #${ROOT_ID} img {
        display: block;
        break-after: page;
        page-break-after: always;
      }
      #${ROOT_ID} img:last-child {
        break-after: auto;
        page-break-after: auto;
      }
    }`;
  document.head.appendChild(style);

  const root = document.createElement('div');
  root.id = ROOT_ID;
  const images = pages.map((page) => {
    const img = document.createElement('img');
    img.src = page.url;
    img.alt = '';
    img.style.width = `${page.widthMm.toFixed(2)}mm`;
    img.style.height = `${page.heightMm.toFixed(2)}mm`;
    root.appendChild(img);
    return img;
  });
  document.body.appendChild(root);
  // Printing must be instant after the tap, so decode everything now.
  await Promise.all(images.map((img) => img.decode().catch(() => {})));
}

window.sgPrint = {
  /// Renders the PDF and prepares printing. Resolves to a JSON string:
  /// [{url, widthMm, heightMm}, ...].
  async prepare(bytes, dpi) {
    keepPdf(bytes);
    const pages = await renderPages(bytes, dpi || 300);
    if (pages.length === 0) throw new Error('empty pdf');
    await buildPrintRoot(pages);
    return JSON.stringify(pages);
  },

  /// Opens the system print dialog. Call it directly from a tap.
  print() {
    window.print();
  },

  /// Fallback when the preview could not be made: open the PDF itself
  /// (its viewer can print). Call it directly from a tap.
  openPdf() {
    if (pdfUrl) window.open(pdfUrl, '_blank');
  },

  clear,
};
