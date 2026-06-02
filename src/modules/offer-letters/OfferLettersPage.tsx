import {
  ArrowLeft,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Trash2,
  WandSparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { PageTransition } from '@/components/animations/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { endpoints } from '@/services/api/endpoints';
import { resourceApi } from '@/services/api/resource.api';
import { httpClient } from '@/services/api/http-client';
import type { ApiResponse } from '@/types/api';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/tables/DataTable';
import { useResourceQuery } from '@/hooks/use-resource-query';
import { getErrorMessage } from '@/lib/errors';
import {
  buildOfferDocument,
  downloadHtmlAsPdf,
  offerStatusBadgeVariant,
  OFFER_STATUS_LABELS,
  stripScriptsForPreview,
} from './offer-letter.utils';

type Template = {
  id: string;
  name: string;
  key: string;
  variables: string[];
  isDefault: boolean;
  htmlContent: string;
  cssContent?: string;
  currentVersion?: number;
};

type Candidate = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type JobPosting = {
  id: string;
  title: string;
  department: string;
};

type OfferLetter = {
  id: string;
  templateId: string;
  template: { id: string; name: string; key: string; currentVersion?: number };
  templateVersion?: { id: string; version: number; name: string } | null;
  candidate?: Candidate | null;
  job?: JobPosting | null;
  createdBy?: { id: string; firstName: string; lastName: string; email: string } | null;
  variables: Record<string, string>;
  generatedUrl?: string | null;
  status: string;
  createdAt: string;
  generatedAt?: string | null;
  renderedHtml?: string | null;
};

type GenerateResult = OfferLetter & {
  generatedHtml: string;
};

type Step = 'form' | 'preview';

export function OfferLettersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState<OfferLetter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferLetter | null>(null);
  const [step, setStep] = useState<Step>('form');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState('');
  const [generatedOffer, setGeneratedOffer] = useState<GenerateResult | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [mobileTab, setMobileTab] = useState<'variables' | 'preview'>('variables');

  const listQuery = useResourceQuery<OfferLetter>('offer-letters', endpoints.offerLetters, {
    page,
    limit: 25,
  });
  const offerLetters = listQuery.data?.items ?? [];
  const totalPages = listQuery.data?.meta.totalPages ?? 1;

  const templatesQuery = useQuery({
    queryKey: ['templates-list'],
    queryFn: () => resourceApi.list<Template>(endpoints.templates, { page: 1, limit: 100 }),
  });
  const templates = templatesQuery.data?.items ?? [];
  const selectedTemplate = templates.find((template) => template.id === selectedTemplateId);

  const candidatesQuery = useQuery({
    queryKey: ['offer-letter-candidates'],
    queryFn: () => resourceApi.list<Candidate>(endpoints.recruitment.candidates, { page: 1, limit: 100 }),
    enabled: generateOpen,
  });
  const jobsQuery = useQuery({
    queryKey: ['offer-letter-jobs'],
    queryFn: () => resourceApi.list<JobPosting>(endpoints.recruitment.jobs, { page: 1, limit: 100 }),
    enabled: generateOpen,
  });

  useEffect(() => {
    if (!selectedTemplate) return;
    setValues((prev) => {
      const next: Record<string, string> = {};
      for (const variable of selectedTemplate.variables) {
        next[variable] = prev[variable] ?? '';
      }
      return next;
    });
  }, [selectedTemplateId, selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate || step !== 'form') return;
    setPreviewHtml(stripScriptsForPreview(buildOfferDocument(selectedTemplate.htmlContent, selectedTemplate.cssContent ?? '', values)));
  }, [values, selectedTemplate, step]);

  const generateMutation = useMutation({
    mutationFn: () =>
      httpClient.post<ApiResponse<GenerateResult>>(endpoints.offerLetterGenerate, {
        templateId: selectedTemplateId,
        candidateId,
        jobId,
        variables: values,
      }),
    onSuccess: (res) => {
      const data = res.data.data;
      setGeneratedOffer(data);
      setPreviewHtml(stripScriptsForPreview(data.generatedHtml));
      setStep('preview');
      toast.success('Offer letter generated');
      void queryClient.invalidateQueries({ queryKey: ['offer-letters'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => httpClient.delete(endpoints.offerLetterDetail(id)),
    onSuccess: () => {
      toast.success('Offer letter deleted');
      setDeleteTarget(null);
      setDetailOffer(null);
      void queryClient.invalidateQueries({ queryKey: ['offer-letters'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      httpClient.patch(endpoints.offerLetterStatus(id), { status }),
    onSuccess: (res) => {
      toast.success('Status updated');
      setDetailOffer(res.data.data as OfferLetter);
      void queryClient.invalidateQueries({ queryKey: ['offer-letters'] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const allFilled = useMemo(
    () => selectedTemplate?.variables.every((variable) => values[variable]?.trim()) ?? false,
    [selectedTemplate, values],
  );

  function openGenerate(cloneFrom?: OfferLetter) {
    setStep('form');
    setGeneratedOffer(null);
    setPreviewHtml('');
    setMobileTab('variables');
    if (cloneFrom) {
      setSelectedTemplateId(cloneFrom.templateId);
      setCandidateId(cloneFrom.candidate?.id ?? '');
      setJobId(cloneFrom.job?.id ?? '');
      setValues({ ...cloneFrom.variables });
    } else {
      const defaultTemplate = templates.find((template) => template.isDefault);
      setSelectedTemplateId(defaultTemplate?.id ?? '');
      setCandidateId('');
      setJobId('');
      setValues({});
    }
    setGenerateOpen(true);
  }

  function closeGenerate() {
    setGenerateOpen(false);
    setStep('form');
    setGeneratedOffer(null);
    setPreviewHtml('');
    setValues({});
    setSelectedTemplateId('');
    setCandidateId('');
    setJobId('');
  }

  async function handleDownload(source?: { html?: string; id?: string; filename?: string }) {
    setDownloading(true);
    try {
      let html = source?.html ?? previewHtml;
      const offerId = source?.id ?? generatedOffer?.id;

      if (offerId && !source?.html) {
        const res = await httpClient.get<ApiResponse<{ html: string }>>(endpoints.offerLetterPreview(offerId));
        html = res.data.data?.html ?? html;
      }

      if (!html) {
        toast.error('No rendered content available for download');
        return;
      }

      await downloadHtmlAsPdf(html, source?.filename ?? `offer-letter-${offerId ?? Date.now()}.pdf`);
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  async function openDetail(offer: OfferLetter) {
    try {
      const res = await httpClient.get<ApiResponse<OfferLetter>>(endpoints.offerLetterDetail(offer.id));
      setDetailOffer(res.data.data ?? offer);
    } catch {
      setDetailOffer(offer);
    }
  }

  const columns: ColumnDef<OfferLetter>[] = [
    {
      id: 'candidate',
      header: 'Candidate',
      cell: ({ row }) => (
        <button type="button" className="text-left" onClick={() => void openDetail(row.original)}>
          <span className="font-medium text-foreground text-sm">
            {row.original.candidate
              ? `${row.original.candidate.firstName} ${row.original.candidate.lastName}`
              : '—'}
          </span>
          <p className="text-xs text-muted-foreground">{row.original.job?.title ?? 'No job linked'}</p>
        </button>
      ),
    },
    {
      id: 'template',
      header: 'Template',
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="font-medium text-foreground">{row.original.template?.name ?? '—'}</p>
          {row.original.templateVersion ? (
            <p className="text-xs text-muted-foreground">v{row.original.templateVersion.version}</p>
          ) : null}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={offerStatusBadgeVariant(row.original.status)}>
          {OFFER_STATUS_LABELS[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      id: 'created',
      header: 'Created',
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" title="Clone & edit" onClick={() => openGenerate(row.original)}>
            <RefreshCw className="size-3.5" />
          </Button>
          <Button size="sm" variant="ghost" title="View details" onClick={() => void openDetail(row.original)}>
            <Eye className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-rose-400 hover:text-rose-300"
            title="Delete"
            onClick={() => setDeleteTarget(row.original)}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Document generation"
          title="Offer letters"
          description="Generate offer letters from versioned templates, preview content, download PDFs, and track offer status."
          actions={
            <Button onClick={() => openGenerate()} disabled={templatesQuery.isLoading}>
              <WandSparkles className="size-4" /> Generate offer
            </Button>
          }
        />

        <SectionCard
          title="Generated offer letters"
          description="Click a row to view details, download PDFs, update status, or delete draft/generated offers."
        >
          <DataTable
            data={offerLetters}
            columns={columns as ColumnDef<Record<string, unknown>>[]}
            isLoading={listQuery.isLoading}
            emptyTitle="No offer letters yet"
            emptyDescription="Generated offer letters will appear here."
            page={page}
            totalPages={totalPages}
            total={listQuery.data?.meta.total ?? offerLetters.length}
            onPageChange={setPage}
          />
        </SectionCard>

        <Dialog
          open={generateOpen}
          onOpenChange={(open) => !generateMutation.isPending && !downloading && (open ? setGenerateOpen(true) : closeGenerate())}
        >
          <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden flex flex-col p-0">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <DialogTitle className="text-base">
                  {step === 'form' ? 'Generate offer letter' : 'Preview offer letter'}
                </DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  {step === 'form'
                    ? 'Select candidate, job, template, and fill mandatory variables before generating.'
                    : 'Review the generated offer and download as PDF.'}
                </DialogDescription>
              </div>
              {step === 'preview' ? (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep('form')}>
                    <ArrowLeft className="size-4" /> Back
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleDownload({
                      ...(generatedOffer?.id ? { id: generatedOffer.id } : {}),
                      html: previewHtml,
                    })}
                    disabled={downloading}
                  >
                    {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    Download PDF
                  </Button>
                </div>
              ) : null}
            </div>

            {step === 'form' ? (
              <div className="flex flex-1 overflow-hidden min-h-0">
                <div className="absolute left-6 top-16 z-10 flex gap-1 rounded-lg border border-border bg-slate-950/80 p-1 md:hidden">
                  {(['variables', 'preview'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setMobileTab(tab)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${mobileTab === tab ? 'bg-white/10 text-foreground' : 'text-muted-foreground'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div
                  className={`flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-r border-border p-6 md:w-96 lg:w-[420px] ${mobileTab === 'preview' ? 'hidden md:flex' : 'flex'}`}
                >
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-foreground">Candidate *</span>
                    <select
                      className="h-10 rounded-lg border border-input bg-slate-950/55 px-3 text-sm text-foreground"
                      value={candidateId}
                      onChange={(event) => setCandidateId(event.target.value)}
                    >
                      <option value="">Select candidate…</option>
                      {(candidatesQuery.data?.items ?? []).map((candidate) => (
                        <option key={candidate.id} value={candidate.id}>
                          {candidate.firstName} {candidate.lastName} ({candidate.email})
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-foreground">Job *</span>
                    <select
                      className="h-10 rounded-lg border border-input bg-slate-950/55 px-3 text-sm text-foreground"
                      value={jobId}
                      onChange={(event) => setJobId(event.target.value)}
                    >
                      <option value="">Select job…</option>
                      {(jobsQuery.data?.items ?? []).map((job) => (
                        <option key={job.id} value={job.id}>
                          {job.title} — {job.department}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-1.5 text-sm">
                    <span className="font-medium text-foreground">Template *</span>
                    <select
                      className="h-10 rounded-lg border border-input bg-slate-950/55 px-3 text-sm text-foreground"
                      value={selectedTemplateId}
                      onChange={(event) => setSelectedTemplateId(event.target.value)}
                    >
                      <option value="">Select template…</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                          {template.isDefault ? ' (default)' : ''}
                          {template.currentVersion ? ` v${template.currentVersion}` : ''}
                        </option>
                      ))}
                    </select>
                  </label>

                  {selectedTemplate?.variables.map((variable) => (
                    <label key={variable} className="grid gap-1 text-sm">
                      <span className="font-mono text-[11px] text-cyan-300">{`{{${variable}}}`}</span>
                      <Input
                        value={values[variable] ?? ''}
                        onChange={(event) => setValues((prev) => ({ ...prev, [variable]: event.target.value }))}
                        placeholder={`Enter ${variable.replace(/_/g, ' ')}…`}
                      />
                    </label>
                  ))}

                  <div className="mt-auto pt-2">
                    <Button
                      className="w-full"
                      onClick={() => generateMutation.mutate()}
                      disabled={
                        generateMutation.isPending ||
                        !selectedTemplateId ||
                        !candidateId ||
                        !jobId ||
                        !allFilled
                      }
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="size-4 animate-spin" /> Generating…
                        </>
                      ) : (
                        <>
                          <WandSparkles className="size-4" /> Generate
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className={`flex flex-1 flex-col overflow-hidden p-4 ${mobileTab === 'variables' ? 'hidden md:flex' : 'flex'}`}>
                  <p className="mb-2 shrink-0 text-xs text-muted-foreground">Live preview</p>
                  {selectedTemplate ? (
                    <div className="flex-1 overflow-hidden rounded-xl border border-border bg-white">
                      <iframe
                        srcDoc={previewHtml}
                        className="h-full w-full"
                        style={{ border: 'none', minHeight: 400 }}
                        title="Offer letter preview"
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-muted-foreground">
                      <p className="text-sm">Select a template to preview</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-1 overflow-hidden min-h-0 p-4">
                <div className="flex-1 overflow-hidden rounded-xl border border-border bg-white">
                  <iframe
                    srcDoc={previewHtml}
                    className="h-full w-full"
                    style={{ border: 'none', minHeight: 500 }}
                    title="Generated offer letter"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={detailOffer !== null} onOpenChange={(open) => !open && setDetailOffer(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Offer letter details</DialogTitle>
              <DialogDescription>Review offer metadata, preview content, and manage status.</DialogDescription>
            </DialogHeader>
            {detailOffer ? (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Candidate</p>
                    <p className="text-sm font-medium">
                      {detailOffer.candidate
                        ? `${detailOffer.candidate.firstName} ${detailOffer.candidate.lastName}`
                        : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Position</p>
                    <p className="text-sm font-medium">{detailOffer.job?.title ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Template</p>
                    <p className="text-sm font-medium">
                      {detailOffer.template?.name ?? '—'}
                      {detailOffer.templateVersion ? ` (v${detailOffer.templateVersion.version})` : ''}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant={offerStatusBadgeVariant(detailOffer.status)}>
                      {OFFER_STATUS_LABELS[detailOffer.status] ?? detailOffer.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(detailOffer.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Generated</p>
                    <p className="text-sm">
                      {detailOffer.generatedAt ? new Date(detailOffer.generatedAt).toLocaleString() : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => void handleDownload({ id: detailOffer.id, filename: `offer-${detailOffer.id}.pdf` })}
                    disabled={downloading}
                  >
                    {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
                    Download PDF
                  </Button>
                  {['SENT', 'ACCEPTED', 'REJECTED', 'CANCELLED'].map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      disabled={statusMutation.isPending || detailOffer.status === status}
                      onClick={() => statusMutation.mutate({ id: detailOffer.id, status })}
                    >
                      Mark {OFFER_STATUS_LABELS[status]}
                    </Button>
                  ))}
                  <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(detailOffer)}>
                    Delete
                  </Button>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>

        <ConfirmModal
          open={deleteTarget !== null}
          title="Delete Offer Letter?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          variant="danger"
          isLoading={deleteMutation.isPending}
          onConfirm={() => {
            if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      </div>
    </PageTransition>
  );
}
