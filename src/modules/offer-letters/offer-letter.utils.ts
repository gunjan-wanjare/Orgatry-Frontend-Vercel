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

  if (/<(script|iframe|object|embed|form|base|meta|link)[\s>]/i.test(html) || (css && /<(script|iframe)[\s>]/i.test(css))) {
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
  const body = interpolateTemplate(html, vars);
  return `<!doctype html><html><head><meta charset="utf-8"><style>body{margin:0;font-family:Georgia,serif;color:#111827;background:#fff}${css}</style></head><body>${body}</body></html>`;
}

/** Remove script tags for iframe preview — scripts cannot run in sandboxed srcDoc anyway. */
export function stripScriptsForPreview(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
}

export async function downloadHtmlAsPdf(html: string, filename: string): Promise<void> {
  const html2pdf = (await import('html2pdf.js')).default;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '0';
  iframe.style.top = '0';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-1';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => resolve();
    iframe.onerror = () => reject(new Error('Failed to load preview frame'));
    iframe.srcdoc = html;
  });

  const images = iframe.contentDocument ? Array.from(iframe.contentDocument.images) : [];
  await Promise.all(
    images.map(
      (image) =>
        new Promise<void>((resolve) => {
          if (image.complete) {
            resolve();
            return;
          }
          image.onload = () => resolve();
          image.onerror = () => resolve();
        }),
    ),
  );

  const target = iframe.contentDocument?.body;
  if (!target) {
    document.body.removeChild(iframe);
    throw new Error('Unable to render PDF content');
  }

  try {
    await html2pdf()
      .set({
        margin: 10,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(target)
      .save();
  } finally {
    document.body.removeChild(iframe);
  }
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
