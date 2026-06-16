import type { AxiosResponse } from 'axios';
import { httpClient } from '@/services/api/http-client';
import { endpoints } from '@/services/api/endpoints';

function triggerBrowserDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function readPdfBlob(response: AxiosResponse<Blob>): Promise<Blob> {
  const contentType = String(response.headers['content-type'] ?? '');
  if (contentType.includes('application/pdf')) {
    return response.data;
  }

  const text = await response.data.text();
  let message = 'PDF generation failed';
  try {
    const payload = JSON.parse(text) as { message?: string };
    if (payload.message) {
      message = payload.message;
    }
  } catch {
    // Non-JSON error body
  }
  throw new Error(message);
}

const PDF_REQUEST_TIMEOUT_MS = 120_000;

export async function downloadOfferLetterPdf(offerId: string, filename: string): Promise<void> {
  const response = await httpClient.get<Blob>(endpoints.offerLetterDownload(offerId), {
    responseType: 'blob',
    timeout: PDF_REQUEST_TIMEOUT_MS,
  });
  const blob = await readPdfBlob(response);
  triggerBrowserDownload(blob, filename);
}

export async function downloadPreviewHtmlAsPdf(
  html: string,
  filename: string,
  meta?: { recipientName?: string | null; templateName?: string | null },
): Promise<void> {
  const response = await httpClient.post<Blob>(
    endpoints.offerLetterPdfPreview,
    {
      html,
      filename,
      recipientName: meta?.recipientName ?? null,
      templateName: meta?.templateName ?? null,
    },
    {
      responseType: 'blob',
      timeout: PDF_REQUEST_TIMEOUT_MS,
    },
  );
  const blob = await readPdfBlob(response);
  triggerBrowserDownload(blob, filename);
}
