/**
 * PDF generation pipeline: Rendered DOM → html2canvas → jsPDF → PDF
 *
 * Entry point: downloadHtmlAsPdf() in this file.
 * Debug canvas-only: localStorage.setItem('PDF_CANVAS_DEBUG', '1')
 * Full logs: localStorage.setItem('PDF_DEBUG', '1')
 */

export const A4_WIDTH_PX = 794;
export const A4_HEIGHT_PX = 1123;
export const LETTER_WIDTH_PX = 816;
export const LETTER_HEIGHT_PX = 1056;
export const PDF_CAPTURE_SCALE = 4;

export function pageDimensions(format: 'a4' | 'letter' = 'a4') {
  return format === 'letter'
    ? { pxWidth: LETTER_WIDTH_PX, pxHeight: LETTER_HEIGHT_PX, jsPdfFormat: 'letter' as const }
    : { pxWidth: A4_WIDTH_PX, pxHeight: A4_HEIGHT_PX, jsPdfFormat: 'a4' as const };
}

export const PDF_PRINT_CSS = `
  @page { size: A4 portrait; }
  html, body {
    background: transparent !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
  .page:last-child {
    page-break-after: auto;
    break-after: auto;
  }
  img {
    max-width: 100%;
    height: auto;
  }
`;

export type PdfDownloadOptions = {
  supplementalCss?: string;
  canvasDebugOnly?: boolean;
  format?: 'a4' | 'letter';
};

export type CaptureLayoutAudit = {
  body: Record<string, string>;
  pages: Array<Record<string, string>>;
  images: Array<{
    src: string;
    naturalWidth: number;
    naturalHeight: number;
    clientWidth: number;
    clientHeight: number;
    aspectRatioPreserved: boolean;
  }>;
  textSamples: Array<{ selector: string; letterSpacing: string; wordSpacing: string; fontSize: string; lineHeight: string }>;
};

export type PdfPipelineConfigs = {
  html2pdf: Record<string, unknown>;
  html2canvas: Record<string, unknown>;
  jsPDF: Record<string, unknown>;
  pagebreak?: Record<string, unknown>;
};

export type PdfGenerationDebugInfo = {
  filename: string;
  htmlLength: number;
  removedStylesheetLinks: string[];
  fetchedExternalCssLength: number;
  injectedCssLength: number;
  images: { total: number; inlined: number; failed: string[] };
  pageElements: number;
  pageDimensions: Array<{ selector: string; width: string; height: string; background: string }>;
  configs: PdfPipelineConfigs;
  stylesheetTextLength: number;
  captureScale: number;
  iframeDimensions: { width: number; height: number };
  canvasDimensions: { width: number; height: number } | null;
  layoutAudit: CaptureLayoutAudit;
  renderLifecycleMs: number;
  pipelineStage: 'html2canvas' | 'html2pdf';
  finalHtmlPreview: string;
};

export function isPdfDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return import.meta.env.DEV || window.localStorage.getItem('PDF_DEBUG') === '1';
}

export function isCanvasDebugEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem('PDF_CANVAS_DEBUG') === '1';
}

export function pdfDebug(label: string, payload?: unknown): void {
  if (!isPdfDebugEnabled()) return;
  if (payload === undefined) {
    console.log(`[PDF] ${label}`);
    return;
  }
  console.log(`[PDF] ${label}`, payload);
}

function logPipelineConfigs(configs: PdfPipelineConfigs): void {
  console.group('[PDF Pipeline] Configuration');
  console.log('html2pdf:', configs.html2pdf);
  console.log('html2canvas:', configs.html2canvas);
  console.log('jsPDF:', configs.jsPDF);
  if (configs.pagebreak) console.log('pagebreak:', configs.pagebreak);
  console.groupEnd();
}

export function stripExternalStylesheetLinks(html: string): { html: string; removedLinks: string[] } {
  const removedLinks: string[] = [];
  const cleaned = html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (match) => {
    removedLinks.push(match);
    return '';
  });
  return { html: cleaned, removedLinks };
}

async function fetchExternalStylesheetCss(html: string): Promise<string> {
  const pattern = /<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi;
  const chunks: string[] = [];
  for (const match of html.matchAll(pattern)) {
    const href = match[0].match(/\bhref=["']([^"']+)["']/i)?.[1];
    if (!href || !/^https?:\/\//i.test(href)) continue;
    try {
      const response = await fetch(href, { mode: 'cors', credentials: 'omit' });
      if (response.ok) chunks.push(await response.text());
    } catch (error) {
      pdfDebug('Failed to fetch external stylesheet', { href, error });
    }
  }
  return chunks.join('\n');
}

export function buildDocumentPdfFilename(
  recipientName?: string | null,
  templateName?: string | null,
): string {
  const sanitize = (value: string) =>
    value.trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');
  const recipient = recipientName ? sanitize(recipientName) : '';
  const template = templateName ? sanitize(templateName) : '';
  if (recipient && template) return `${recipient}_${template}.pdf`;
  if (recipient) return `${recipient}_Document.pdf`;
  if (template) return `Document_${template}.pdf`;
  return 'Document.pdf';
}

export function extractInlineCssFromHtml(html: string): string {
  const styles: string[] = [];
  const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
  let match: RegExpExecArray | null;
  while ((match = styleRegex.exec(html)) !== null) {
    if (match[1]) styles.push(match[1]);
  }
  return styles.join('\n');
}

export function mergeSupplementalCss(html: string, supplementalCss?: string): string {
  const css = supplementalCss?.trim();
  if (!css || html.includes('data-supplemental-css')) return html;
  const tag = `<style data-supplemental-css="true">\n${css}\n</style>`;
  if (html.includes('</head>')) return html.replace('</head>', `${tag}</head>`);
  if (html.includes('<body')) return html.replace(/<body([^>]*)>/i, `<body$1>${tag}`);
  return `${tag}${html}`;
}

export function ensureFullDocumentHtml(html: string, supplementalCss?: string): string {
  const withCss = mergeSupplementalCss(html.trim(), supplementalCss);
  if (/^<!doctype html>/i.test(withCss) || /<html[\s>]/i.test(withCss)) return withCss;
  const bodyCss = supplementalCss?.trim() ?? '';
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Georgia,serif;color:#242424;background:transparent}${bodyCss}</style></head><body>${withCss}</body></html>`;
}

export async function normalizeHtmlDocumentForPdf(html: string, supplementalCss?: string) {
  let doc = ensureFullDocumentHtml(html, supplementalCss);
  const fetchedExternalCss = await fetchExternalStylesheetCss(doc);
  if (fetchedExternalCss) doc = mergeSupplementalCss(doc, fetchedExternalCss);

  const removedLinks: string[] = [];
  const stripped = stripExternalStylesheetLinks(doc);
  doc = stripped.html;
  removedLinks.push(...stripped.removedLinks);
  const strippedBody = stripExternalStylesheetLinks(doc);
  doc = strippedBody.html;
  removedLinks.push(...strippedBody.removedLinks);

  const existingCss = extractInlineCssFromHtml(doc);
  if (!doc.includes('data-pdf-engine')) {
    const injection = `<style data-pdf-engine="true">${PDF_PRINT_CSS}</style>`;
    doc = doc.includes('</head>') ? doc.replace('</head>', `${injection}</head>`) : `${injection}${doc}`;
  }
  return { html: doc, removedLinks, existingCss, fetchedExternalCss };
}

function collectStylesFromDocument(doc: Document): string {
  const parts: string[] = [];
  doc.querySelectorAll('style').forEach((node) => {
    const text = node.textContent?.trim();
    if (text) parts.push(text);
  });
  for (const sheet of Array.from(doc.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) parts.push(rule.cssText);
    } catch { /* cross-origin */ }
  }
  return parts.join('\n');
}

function buildStylesheetForCapture(doc: Document, parsedCss: string, supplementalCss: string, fetchedExternalCss: string): string {
  return [parsedCss, fetchedExternalCss, supplementalCss, collectStylesFromDocument(doc), PDF_PRINT_CSS]
    .map((c) => c.trim()).filter(Boolean).join('\n\n');
}

async function waitForImages(doc: Document, timeoutMs = 20000): Promise<void> {
  await Promise.all(Array.from(doc.images).map((image) => new Promise<void>((resolve) => {
    if (image.complete && image.naturalWidth > 0) { resolve(); return; }
    const timer = window.setTimeout(resolve, timeoutMs);
    image.onload = () => { window.clearTimeout(timer); resolve(); };
    image.onerror = () => { window.clearTimeout(timer); resolve(); };
  })));
}

async function waitForFonts(doc: Document): Promise<void> {
  await doc.fonts?.ready;
  const families = new Set<string>();
  doc.querySelectorAll('*').forEach((el) => {
    const family = doc.defaultView?.getComputedStyle(el).fontFamily;
    if (family) families.add(family);
  });
  await Promise.all(Array.from(families).flatMap((family) =>
    [12, 14, 16].map((size) => doc.fonts.load(`${size}px ${family}`).catch(() => undefined)),
  ));
}

async function waitForAnimationFrames(count = 2): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }
}

export async function inlineImagesAsDataUrls(doc: Document) {
  const images = Array.from(doc.querySelectorAll('img'));
  const failed: string[] = [];
  let inlined = 0;
  await Promise.all(images.map(async (img) => {
    const src = img.getAttribute('src') ?? img.src;
    if (!src || src.startsWith('data:')) return;
    try {
      const response = await fetch(src, { mode: 'cors', credentials: 'omit' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      img.src = dataUrl;
      inlined += 1;
    } catch { failed.push(src); }
  }));
  return { total: images.length, inlined, failed };
}

function pickStyle(view: Window, el: Element, keys: string[]): Record<string, string> {
  const cs = view.getComputedStyle(el);
  const out: Record<string, string> = {};
  for (const key of keys) out[key] = cs.getPropertyValue(key) || '';
  return out;
}

export function auditCaptureLayout(doc: Document): CaptureLayoutAudit {
  const view = doc.defaultView!;
  const styleKeys = ['width', 'height', 'margin', 'padding', 'background-color', 'color'];
  const images = Array.from(doc.querySelectorAll('img')).map((img) => {
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const cw = img.clientWidth;
    const ch = img.clientHeight;
    const expectedRatio = nw / Math.max(nh, 1);
    const actualRatio = cw / Math.max(ch, 1);
    return {
      src: img.src.slice(0, 120),
      naturalWidth: nw,
      naturalHeight: nh,
      clientWidth: cw,
      clientHeight: ch,
      aspectRatioPreserved: nw === 0 || Math.abs(expectedRatio - actualRatio) < 0.05,
    };
  });
  const textSamples: CaptureLayoutAudit['textSamples'] = [];
  for (const sel of ['h1', 'h2', 'p', '.page', 'td']) {
    const el = doc.querySelector(sel);
    if (!el) continue;
    const cs = view.getComputedStyle(el);
    textSamples.push({ selector: sel, letterSpacing: cs.letterSpacing, wordSpacing: cs.wordSpacing, fontSize: cs.fontSize, lineHeight: cs.lineHeight });
  }
  return {
    body: pickStyle(view, doc.body, styleKeys),
    pages: Array.from(doc.querySelectorAll('.page')).map((p) => pickStyle(view, p, styleKeys)),
    images,
    textSamples,
  };
}

function createPdfRenderFrame(pxWidth = A4_WIDTH_PX, pxHeight = A4_HEIGHT_PX): HTMLIFrameElement {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('title', 'PDF render frame');
  iframe.style.cssText = `position:fixed;left:-12000px;top:0;width:${pxWidth}px;min-height:${pxHeight}px;height:auto;opacity:1;pointer-events:none;border:none;background:#fff;z-index:-1`;
  return iframe;
}

function injectStylesIntoLiveDocument(doc: Document, stylesheetText: string): void {
  doc.querySelector('style[data-pdf-capture-styles]')?.remove();
  const style = doc.createElement('style');
  style.setAttribute('data-pdf-capture-styles', 'true');
  style.textContent = stylesheetText;
  doc.body.prepend(style);
}

function lockDocumentWidth(doc: Document, pxWidth = A4_WIDTH_PX): void {
  for (const el of [doc.documentElement, doc.body]) {
    el.style.width = `${pxWidth}px`;
    el.style.maxWidth = `${pxWidth}px`;
    el.style.margin = '0';
    el.style.padding = '0';
  }
}

function expandIframeToDocument(iframe: HTMLIFrameElement, doc: Document, pxWidth = A4_WIDTH_PX, pxHeight = A4_HEIGHT_PX) {
  const height = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight, pxHeight);
  iframe.style.width = `${pxWidth}px`;
  iframe.style.height = `${height}px`;
  return { width: pxWidth, height };
}

function buildPipelineConfigs(filename: string, stylesheetText: string, pageCount: number, format: 'a4' | 'letter' = 'a4'): PdfPipelineConfigs {
  const fmt = format === 'letter' ? 'letter' : 'a4';
  const dims = pageDimensions(fmt);
  const html2canvasConfig: Record<string, unknown> = {
    scale: PDF_CAPTURE_SCALE,
    useCORS: true,
    allowTaint: false,
    backgroundColor: null,
    logging: isPdfDebugEnabled(),
    scrollX: 0,
    scrollY: 0,
    windowWidth: dims.pxWidth,
    width: dims.pxWidth,
    onclone: (clonedDoc: Document, clonedElement: HTMLElement) => {
      const cloneStyle = clonedDoc.createElement('style');
      cloneStyle.setAttribute('data-pdf-capture-styles', 'true');
      cloneStyle.textContent = stylesheetText;
      clonedElement.insertBefore(cloneStyle, clonedElement.firstChild);
      clonedDoc.documentElement.style.background = '#ffffff';
      clonedDoc.documentElement.style.width = `${dims.pxWidth}px`;
      clonedDoc.body.style.background = '#ffffff';
      clonedDoc.body.style.color = '#242424';
      clonedDoc.body.style.width = `${dims.pxWidth}px`;
      clonedDoc.body.style.margin = '0';
      clonedDoc.body.style.padding = '0';
    },
  };
  const jsPDFConfig = { unit: 'mm', format: dims.jsPdfFormat, orientation: 'portrait' as const };
  const html2pdfConfig: Record<string, unknown> = {
    margin: 0,
    filename,
    image: { type: 'jpeg', quality: 1 },
    html2canvas: html2canvasConfig,
    jsPDF: jsPDFConfig,
  };
  const configs: PdfPipelineConfigs = { html2pdf: html2pdfConfig, html2canvas: html2canvasConfig, jsPDF: jsPDFConfig };
  if (pageCount > 1) {
    configs.pagebreak = { mode: ['css', 'legacy'], before: '.page + .page' };
    html2pdfConfig.pagebreak = configs.pagebreak;
  }
  return configs;
}

type PreparedRender = {
  iframe: HTMLIFrameElement;
  doc: Document;
  captureRoot: HTMLElement;
  stylesheetText: string;
  pageCount: number;
  imageStats: { total: number; inlined: number; failed: string[] };
  normalizedHtml: string;
  removedLinks: string[];
  fetchedExternalCss: string;
  iframeDimensions: { width: number; height: number };
  layoutAudit: CaptureLayoutAudit;
};

async function preparePdfRender(html: string, supplementalCss: string, format: 'a4' | 'letter' = 'a4'): Promise<PreparedRender> {
  const dims = pageDimensions(format);
  const { html: normalizedHtml, removedLinks, existingCss, fetchedExternalCss } =
    await normalizeHtmlDocumentForPdf(html, supplementalCss);
  const iframe = createPdfRenderFrame(dims.pxWidth, dims.pxHeight);
  document.body.appendChild(iframe);
  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => resolve();
    iframe.onerror = () => reject(new Error('Failed to load PDF render frame'));
    iframe.srcdoc = normalizedHtml;
  });
  const doc = iframe.contentDocument;
  if (!doc?.body) {
    document.body.removeChild(iframe);
    throw new Error('Unable to access PDF render document');
  }
  lockDocumentWidth(doc, dims.pxWidth);
  const imageStats = await inlineImagesAsDataUrls(doc);
  await waitForFonts(doc);
  await waitForImages(doc);
  await waitForAnimationFrames(2);
  const stylesheetText = buildStylesheetForCapture(doc, existingCss, supplementalCss, fetchedExternalCss);
  injectStylesIntoLiveDocument(doc, stylesheetText);
  lockDocumentWidth(doc, dims.pxWidth);
  await waitForAnimationFrames(2);
  return {
    iframe,
    doc,
    captureRoot: doc.body,
    stylesheetText,
    pageCount: doc.querySelectorAll('.page').length,
    imageStats,
    normalizedHtml,
    removedLinks,
    fetchedExternalCss,
    iframeDimensions: expandIframeToDocument(iframe, doc, dims.pxWidth, dims.pxHeight),
    layoutAudit: auditCaptureLayout(doc),
  };
}

export async function captureDomToCanvas(captureRoot: HTMLElement, html2canvasConfig: Record<string, unknown>): Promise<HTMLCanvasElement> {
  const html2canvas = (await import('html2canvas')).default;
  return html2canvas(captureRoot, html2canvasConfig as Parameters<typeof html2canvas>[1]);
}

export function openCanvasComparisonWindow(prepared: PreparedRender, canvas: HTMLCanvasElement): void {
  const win = window.open('', '_blank', 'width=1400,height=900');
  if (!win) return;
  const dataUrl = canvas.toDataURL('image/png');
  const auditJson = JSON.stringify(prepared.layoutAudit, null, 2).replace(/</g, '&lt;');
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>PDF Canvas Debug</title>
<style>body{font-family:system-ui;margin:0;background:#1e1e1e;color:#eee}header{padding:12px 16px;background:#111;border-bottom:1px solid #333}.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:12px}.panel{background:#2a2a2a;border-radius:8px;padding:8px;overflow:auto;max-height:75vh}.panel h2{margin:0 0 8px;font-size:14px}iframe{width:${A4_WIDTH_PX}px;border:1px solid #555;background:#fff}img{max-width:100%;border:1px solid #555;background:#fff}pre{font-size:11px;white-space:pre-wrap;max-height:200px;overflow:auto;background:#111;padding:8px;border-radius:4px}</style></head><body>
<header><strong>PDF pipeline debug</strong> — DOM @ 794px vs html2canvas @ scale ${PDF_CAPTURE_SCALE}</header>
<div class="grid"><div class="panel"><h2>Browser DOM</h2><iframe id="dom"></iframe></div><div class="panel"><h2>html2canvas</h2><img src="${dataUrl}" alt="canvas"/></div></div>
<div style="padding:12px"><h2>Layout audit</h2><pre>${auditJson}</pre></div></body></html>`);
  const frame = win.document.getElementById('dom') as HTMLIFrameElement | null;
  if (frame) frame.srcdoc = prepared.normalizedHtml;
  win.document.close();
}

function logPageDimensions(doc: Document) {
  return ['html', 'body', '.page'].flatMap((selector) => {
    const el = doc.querySelector(selector);
    if (!el || !doc.defaultView) return [];
    const cs = doc.defaultView.getComputedStyle(el);
    return [{ selector, width: cs.width, height: cs.height, background: cs.backgroundColor }];
  });
}

/** Primary entry: client/src/modules/offer-letters/pdf-generation.utils.ts → downloadHtmlAsPdf() */
export async function downloadHtmlAsPdf(html: string, filename: string, options: PdfDownloadOptions = {}): Promise<PdfGenerationDebugInfo> {
  const startMs = performance.now();
  const supplementalCss = options.supplementalCss?.trim() ?? '';
  const canvasDebugOnly = options.canvasDebugOnly ?? isCanvasDebugEnabled();
  const format = options.format ?? 'a4';
  const prepared = await preparePdfRender(html, supplementalCss, format);
  const configs = buildPipelineConfigs(filename, prepared.stylesheetText, prepared.pageCount, format);

  if (isPdfDebugEnabled() || canvasDebugOnly) logPipelineConfigs(configs);

  let canvasDimensions: { width: number; height: number } | null = null;
  let pipelineStage: PdfGenerationDebugInfo['pipelineStage'] = 'html2pdf';

  try {
    const canvas = await captureDomToCanvas(prepared.captureRoot, configs.html2canvas);
    canvasDimensions = { width: canvas.width, height: canvas.height };

    if (canvasDebugOnly) {
      pipelineStage = 'html2canvas';
      openCanvasComparisonWindow(prepared, canvas);
      console.info('[PDF] Canvas debug — PDF skipped. Remove PDF_CANVAS_DEBUG to save PDF.');
    } else {
      const html2pdf = (await import('html2pdf.js')).default;
      await html2pdf().set(configs.html2pdf).from(prepared.captureRoot).save();
    }
  } finally {
    document.body.removeChild(prepared.iframe);
  }

  return {
    filename,
    htmlLength: prepared.normalizedHtml.length,
    removedStylesheetLinks: prepared.removedLinks,
    fetchedExternalCssLength: prepared.fetchedExternalCss.length,
    injectedCssLength: PDF_PRINT_CSS.length,
    images: prepared.imageStats,
    pageElements: prepared.pageCount,
    pageDimensions: logPageDimensions(prepared.doc),
    configs,
    stylesheetTextLength: prepared.stylesheetText.length,
    captureScale: PDF_CAPTURE_SCALE,
    iframeDimensions: prepared.iframeDimensions,
    canvasDimensions,
    layoutAudit: prepared.layoutAudit,
    renderLifecycleMs: Math.round(performance.now() - startMs),
    pipelineStage,
    finalHtmlPreview: prepared.doc.documentElement.outerHTML,
  };
}

export async function debugHtml2CanvasCapture(html: string, supplementalCss?: string): Promise<PdfGenerationDebugInfo> {
  return downloadHtmlAsPdf(html, 'debug-capture.pdf', {
    ...(supplementalCss ? { supplementalCss } : {}),
    canvasDebugOnly: true,
  });
}

export async function openPdfDebugPreview(html: string, supplementalCss?: string): Promise<void> {
  const { html: normalized } = await normalizeHtmlDocumentForPdf(html, supplementalCss ?? '');
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.open();
  win.document.write(normalized);
  win.document.close();
}
