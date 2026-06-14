export const TEMPLATE_SAMPLE_DATA: Record<string, string> = {
  employee_name: 'John Doe',
  candidate_name: 'John Doe',
  designation: 'Software Engineer',
  salary: '₹12,00,000',
  joining_date: '01 July 2026',
  department: 'Engineering',
  company_name: 'IITIL Technologies',
  offer_date: '01 June 2026',
  reporting_manager: 'Jane Smith',
  location: 'Bangalore',
};

export type TemplateValidationIssue = {
  type: 'error' | 'warning';
  message: string;
  field?: string;
};

export type TemplateValidationResult = {
  valid: boolean;
  variables: string[];
  issues: TemplateValidationIssue[];
};

const VARIABLE_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

export function extractTemplateVariables(html: string): string[] {
  const vars = new Set<string>();
  for (const match of html.matchAll(VARIABLE_PATTERN)) {
    const name = match[1];
    if (name) vars.add(name);
  }
  return Array.from(vars);
}

export function validateTemplateContent(html: string, css?: string | null): TemplateValidationResult {
  const issues: TemplateValidationIssue[] = [];
  const variables = extractTemplateVariables(html);

  if (!html.trim()) {
    issues.push({ type: 'error', message: 'HTML content is required' });
  }

  if (/\{\{[^}]*$/.test(html)) {
    issues.push({ type: 'error', message: 'Malformed placeholder syntax (unclosed {{ )' });
  }

  if (/<(script|iframe|object|embed)[\s>]/i.test(html) || (css && /<(script|iframe)[\s>]/i.test(css))) {
    issues.push({ type: 'error', message: 'Unsafe HTML tags are not allowed' });
  }

  if (/javascript:/i.test(html) || (css && /javascript:/i.test(css))) {
    issues.push({ type: 'error', message: 'javascript: URLs are not allowed' });
  }

  if (/\son[a-z]+\s*=/i.test(html)) {
    issues.push({ type: 'error', message: 'Inline event handlers are not allowed' });
  }

  const open = (html.match(/\{\{/g) ?? []).length;
  const close = (html.match(/\}\}/g) ?? []).length;
  if (open !== close) {
    issues.push({ type: 'error', message: 'Mismatched placeholder braces' });
  }

  if (variables.length === 0) {
    issues.push({ type: 'warning', message: 'No template variables detected' });
  }

  return {
    valid: issues.every((issue) => issue.type !== 'error'),
    variables,
    issues,
  };
}

export function interpolateTemplate(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_match, key: string) => vars[key] ?? '');
}

export function buildOfferDocument(html: string, css: string, vars: Record<string, string>): string {
  const interpolated = interpolateTemplate(html, vars);
  const { html: bodyHtml } = stripExternalStylesheetLinks(interpolated);
  const safeCss = css ?? '';
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{margin:0;font-family:Georgia,serif;color:#242424;background:#ffffff}${safeCss}</style></head><body>${bodyHtml}</body></html>`;
}

function stripExternalStylesheetLinks(html: string): { html: string; removedLinks: string[] } {
  const removedLinks: string[] = [];
  const cleaned = html.replace(/<link\b[^>]*\brel=["']stylesheet["'][^>]*>/gi, (match) => {
    removedLinks.push(match);
    return '';
  });
  return { html: cleaned, removedLinks };
}

/** Remove script tags for iframe preview — scripts cannot run in sandboxed srcDoc anyway. */
export function stripScriptsForPreview(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export const OFFER_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  GENERATED: 'Generated',
  SENT: 'Sent',
  VIEWED: 'Viewed',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled',
};

export function offerStatusBadgeVariant(status: string): 'violet' | 'success' | 'outline' | 'warning' {
  switch (status) {
    case 'ACCEPTED':
      return 'success';
    case 'REJECTED':
    case 'CANCELLED':
    case 'EXPIRED':
      return 'warning';
    default:
      return 'violet';
  }
}

function fmtINR(n: number): string {
  return Number(n).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numberToIndianWords(n: number): string {
  if (n === 0) return 'Zero Only';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function twoDigits(x: number): string {
    if (x < 20) return ones[x] ?? '';
    return (tens[Math.floor(x / 10)] + (x % 10 ? ' ' + ones[x % 10] : '')).trim();
  }
  function threeDigits(x: number): string {
    if (x >= 100) return (ones[Math.floor(x / 100)] ?? '') + ' Hundred' + (x % 100 ? ' ' + twoDigits(x % 100) : '');
    return twoDigits(x);
  }

  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thou = Math.floor((n % 100_000) / 1_000);
  const rest = n % 1_000;
  const parts: string[] = [];
  if (crore) parts.push(threeDigits(crore) + ' Crore');
  if (lakh) parts.push(twoDigits(lakh) + ' Lakh');
  if (thou) parts.push(twoDigits(thou) + ' Thousand');
  if (rest) parts.push(threeDigits(rest));
  return parts.join(' ') + ' Only';
}

const FORMULA_HELPERS: Record<string, unknown> = {
  formatINR: fmtINR,
  numberToWords: numberToIndianWords,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
  abs: Math.abs,
};

/** Only coerce values that are clearly numeric (not dates or free text). */
function coerceFormulaVariable(value: string): string | number {
  const trimmed = String(value).trim();
  if (!trimmed) return value;

  // Must not contain letters — avoids "01 July 2026" → 12026
  if (/[a-zA-Z]/.test(trimmed)) return value;

  const normalized = trimmed.replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.') return value;

  const num = Number(normalized);
  return Number.isFinite(num) ? num : value;
}

export function applyFormulas(
  variables: Record<string, string>,
  formulas: Record<string, string>,
): Record<string, string> {
  const ctx: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(variables)) {
    ctx[k] = coerceFormulaVariable(v);
  }

  const remaining = { ...formulas };
  let passes = 0;
  while (Object.keys(remaining).length > 0 && passes < 20) {
    passes++;
    for (const [varName, expr] of Object.entries(remaining)) {
      try {
        const fn = new Function(
          ...Object.keys(FORMULA_HELPERS),
          ...Object.keys(ctx),
          `return (${expr});`,
        );
        ctx[varName] = fn(...Object.values(FORMULA_HELPERS), ...Object.values(ctx));
        delete remaining[varName];
      } catch {
        // Dependency not yet resolved — retry next pass
      }
    }
  }

  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(ctx)) {
    result[k] = String(v);
  }
  return result;
}

export function getComputedVariableNames(formulas: Record<string, string>): Set<string> {
  return new Set(Object.keys(formulas));
}

export {
  buildDocumentPdfFilename,
  downloadHtmlAsPdf,
  debugHtml2CanvasCapture,
  captureDomToCanvas,
  auditCaptureLayout,
  isPdfDebugEnabled,
  isCanvasDebugEnabled,
  openPdfDebugPreview,
  pdfDebug,
  PDF_CAPTURE_SCALE,
} from './pdf-generation.utils';
export { downloadOfferLetterPdf, downloadPreviewHtmlAsPdf } from './pdf-download.utils';
export type { PdfGenerationDebugInfo, PdfDownloadOptions, PdfPipelineConfigs, CaptureLayoutAudit } from './pdf-generation.utils';
