import { downloadHtmlAsPdf } from '@/modules/offer-letters/pdf-generation.utils';
import { generateSettlementLetterHtml } from './settlement-letter.utils';
import type { FnFSettlementDetail } from '@/types/fnf-settlement';

function createOverlay(): HTMLDivElement {
  const div = document.createElement('div');
  div.id = '__fnf-pdf-overlay__';
  div.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;';
  div.innerHTML = '<div style="display:flex;align-items:center;gap:12px;border-radius:8px;border:1px solid hsl(var(--border));background:hsl(var(--card));padding:16px 24px;box-shadow:0 4px 24px rgba(0,0,0,0.2)"><svg class="animate-spin" style="height:20px;width:20px;color:hsl(var(--primary))" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-dasharray="31.4 31.4" stroke-linecap="round"/></svg><span style="font-size:14px;font-weight:500;color:hsl(var(--foreground))">Generating PDF\u2026</span></div>';
  return div;
}

export async function downloadFnFSettlementPdf(settlement: FnFSettlementDetail): Promise<void> {
  const overlay = createOverlay();
  document.body.appendChild(overlay);
  try {
    const html = generateSettlementLetterHtml(settlement);
    const filename = `F&F-Settlement-Letter.pdf`;
    await downloadHtmlAsPdf(html, filename, { format: 'letter' });
  } finally {
    document.body.removeChild(overlay);
  }
}
