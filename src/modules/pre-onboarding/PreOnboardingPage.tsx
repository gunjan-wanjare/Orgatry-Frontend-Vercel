import {
  CheckCircle2,
  Loader2,
  RefreshCw,
  Send,
  UserPlus,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ColumnDef } from '@tanstack/react-table';
import { PageTransition } from '@/components/animations/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { DataTable } from '@/components/tables/DataTable';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { endpoints } from '@/services/api/endpoints';
import { httpClient } from '@/services/api/http-client';
import { useResourceQuery } from '@/hooks/use-resource-query';
import { getErrorMessage } from '@/lib/errors';
import type { ApiResponse } from '@/types/api';

type PreOnboardingRecord = {
  id: string;
  status: string;
  completionPercent?: number;
  tokenExpiresAt?: string;
  rejectionReason?: string | null;
  candidate?: { firstName: string; lastName: string; email: string } | null;
  offer?: { job?: { title: string; department: string } | null } | null;
  verificationItems?: Array<{ checkType: string; status: string; remarks?: string | null }>;
  documents?: Array<{ id: string; documentType: string; verificationStatus: string; fileUrl: string }>;
  personal?: { firstName: string; lastName: string } | null;
};

const STATUS_OPTIONS = [
  'PENDING_DOCUMENTS',
  'UNDER_VERIFICATION',
  'READY_FOR_EMPLOYEE_CREATION',
  'CONVERTED',
  'REJECTED',
];

const CHECK_TYPES = ['AADHAAR', 'PAN', 'BANK', 'PHOTO', 'IDENTITY'];

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (status === 'READY_FOR_EMPLOYEE_CREATION') return 'default';
  if (status === 'UNDER_VERIFICATION') return 'secondary';
  if (status === 'REJECTED') return 'destructive';
  if (status === 'CONVERTED') return 'outline';
  return 'outline';
}

export function PreOnboardingPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<PreOnboardingRecord | null>(null);
  const [sendBackOpen, setSendBackOpen] = useState(false);
  const [sendBackReason, setSendBackReason] = useState('');
  const [convertOpen, setConvertOpen] = useState(false);
  const [bulkApproveOpen, setBulkApproveOpen] = useState(false);
  const [portalToken, setPortalToken] = useState<string | null>(null);

  const listQuery = useResourceQuery<PreOnboardingRecord>('pre-onboarding', endpoints.preOnboarding.list, {
    page,
    limit: 10,
    filters: statusFilter ? { status: statusFilter } : {},
  });

  const detailQuery = useQuery({
    queryKey: ['pre-onboarding', selected?.id],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<PreOnboardingRecord>>(
        endpoints.preOnboarding.detail(selected!.id),
      );
      return response.data.data;
    },
    enabled: Boolean(selected?.id),
  });

  const detail = detailQuery.data ?? selected;

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: [endpoints.preOnboarding.list] });
    if (selected?.id) {
      queryClient.invalidateQueries({ queryKey: ['pre-onboarding', selected.id] });
    }
  };

  const verifyMutation = useMutation({
    mutationFn: async (input: { checkType: string; status: string; remarks?: string }) => {
      await httpClient.post(endpoints.preOnboarding.verify(selected!.id), input);
    },
    onSuccess: () => {
      toast.success('Verification item updated');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const bulkApproveMutation = useMutation({
    mutationFn: async () => {
      await httpClient.post(endpoints.preOnboarding.bulkApprove(selected!.id));
    },
    onSuccess: () => {
      toast.success('All items approved');
      setBulkApproveOpen(false);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      await httpClient.post(endpoints.preOnboarding.approve(selected!.id));
    },
    onSuccess: () => {
      toast.success('Ready for employee creation');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const sendBackMutation = useMutation({
    mutationFn: async () => {
      await httpClient.post(endpoints.preOnboarding.sendBack(selected!.id), { reason: sendBackReason });
    },
    onSuccess: () => {
      toast.success('Sent back to candidate');
      setSendBackOpen(false);
      setSendBackReason('');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const convertMutation = useMutation({
    mutationFn: async () => {
      const response = await httpClient.post<ApiResponse<{ employee: { id: string; employeeId: string } }>>(
        endpoints.preOnboarding.convert(selected!.id),
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success(`Employee ${data?.employee?.employeeId ?? ''} created`);
      setConvertOpen(false);
      setSelected(null);
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const regenerateTokenMutation = useMutation({
    mutationFn: async () => {
      const response = await httpClient.post<
        ApiResponse<{ portalToken: string; portalPath: string }>
      >(endpoints.preOnboarding.regenerateToken(selected!.id));
      return response.data.data;
    },
    onSuccess: (data) => {
      setPortalToken(data?.portalToken ?? null);
      toast.success('Portal link regenerated');
      invalidate();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const columns = useMemo<ColumnDef<PreOnboardingRecord>[]>(
    () => [
      {
        accessorKey: 'candidate',
        header: 'Candidate',
        cell: ({ row }) => {
          const candidate = row.original.candidate;
          const personal = row.original.personal;
          const name = candidate
            ? `${candidate.firstName} ${candidate.lastName}`
            : personal
              ? `${personal.firstName} ${personal.lastName}`
              : '—';
          return (
            <div>
              <p className="font-medium">{name}</p>
              <p className="text-xs text-muted-foreground">{candidate?.email ?? ''}</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'offer',
        header: 'Role',
        cell: ({ row }) => row.original.offer?.job?.title ?? '—',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={statusVariant(row.original.status)}>{row.original.status.replace(/_/g, ' ')}</Badge>
        ),
      },
      {
        accessorKey: 'completionPercent',
        header: 'Progress',
        cell: ({ row }) => `${row.original.completionPercent ?? 0}%`,
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button size="sm" variant="outline" onClick={() => setSelected(row.original)}>
            Review
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <PageTransition>
      <PageHeader
        title="Pre-Onboarding Verification"
        description="Review candidate submissions, verify documents, and convert approved records to employees."
      />

      <div className="mt-6">
      <SectionCard title="Queue">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select value={statusFilter || 'ALL'} onValueChange={(value) => setStatusFilter(value === 'ALL' ? '' : value)}>
            <SelectTrigger className="w-56">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => listQuery.refetch()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        <DataTable
          columns={columns}
          data={listQuery.data?.items ?? []}
          isLoading={listQuery.isLoading}
          page={page}
          totalPages={listQuery.data?.meta.totalPages ?? 1}
          onPageChange={setPage}
          emptyTitle="No pre-onboarding records"
          emptyDescription="Records are created automatically when an offer is accepted."
        />
      </SectionCard>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pre-Onboarding Review</DialogTitle>
            <DialogDescription>
              {detail?.candidate
                ? `${detail.candidate.firstName} ${detail.candidate.lastName} · ${detail.candidate.email}`
                : 'Candidate details'}
            </DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : detail ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusVariant(detail.status)}>{detail.status.replace(/_/g, ' ')}</Badge>
                {detail.rejectionReason ? (
                  <p className="text-sm text-destructive">{detail.rejectionReason}</p>
                ) : null}
              </div>

              <div>
                <h4 className="mb-2 text-sm font-semibold">Verification Checklist</h4>
                <div className="space-y-2">
                  {CHECK_TYPES.map((checkType) => {
                    const item = detail.verificationItems?.find((entry) => entry.checkType === checkType);
                    const itemStatus = item?.status ?? 'PENDING';
                    return (
                      <div key={checkType} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                        <div>
                          <p className="font-medium">{checkType}</p>
                          {item?.remarks ? <p className="text-xs text-muted-foreground">{item.remarks}</p> : null}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={verifyMutation.isPending || detail.status === 'CONVERTED'}
                            onClick={() => verifyMutation.mutate({ checkType, status: 'APPROVED' })}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={verifyMutation.isPending || detail.status === 'CONVERTED'}
                            onClick={() => {
                              const remarks = window.prompt('Rejection remarks (min 10 chars)');
                              if (remarks && remarks.length >= 10) {
                                verifyMutation.mutate({ checkType, status: 'REJECTED', remarks });
                              }
                            }}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                        <Badge variant={itemStatus === 'APPROVED' ? 'default' : itemStatus === 'REJECTED' ? 'destructive' : 'secondary'}>
                          {itemStatus}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </div>

              {detail.documents && detail.documents.length > 0 ? (
                <div>
                  <h4 className="mb-2 text-sm font-semibold">Documents</h4>
                  <div className="space-y-2">
                    {detail.documents.map((document) => (
                      <div key={document.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                        <span>{document.documentType.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-2">
                          <a href={document.fileUrl} target="_blank" rel="noreferrer" className="text-primary underline">
                            Preview
                          </a>
                          <Badge variant="outline">{document.verificationStatus}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  disabled={regenerateTokenMutation.isPending || detail.status === 'CONVERTED'}
                  onClick={() => regenerateTokenMutation.mutate()}
                >
                  {regenerateTokenMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                  Regenerate Portal Link
                </Button>
                {portalToken ? (
                  <Input readOnly value={`${window.location.origin}/onboarding/${portalToken}`} className="flex-1 text-xs" />
                ) : null}
                <Button
                  variant="outline"
                  disabled={detail.status !== 'UNDER_VERIFICATION'}
                  onClick={() => setBulkApproveOpen(true)}
                >
                  Bulk Approve
                </Button>
                <Button
                  variant="outline"
                  disabled={approveMutation.isPending || !['UNDER_VERIFICATION', 'APPROVED'].includes(detail.status)}
                  onClick={() => approveMutation.mutate()}
                >
                  Mark Ready
                </Button>
                <Button variant="outline" disabled={detail.status === 'CONVERTED'} onClick={() => setSendBackOpen(true)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Back
                </Button>
                <Button
                  disabled={detail.status !== 'READY_FOR_EMPLOYEE_CREATION' || convertMutation.isPending}
                  onClick={() => setConvertOpen(true)}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Convert to Employee
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={bulkApproveOpen}
        title="Bulk approve all checks?"
        description="This will approve all mandatory verification items for this record."
        confirmLabel="Approve All"
        onConfirm={() => bulkApproveMutation.mutate()}
        onCancel={() => setBulkApproveOpen(false)}
        isLoading={bulkApproveMutation.isPending}
      />

      <ConfirmModal
        open={convertOpen}
        title="Convert to employee?"
        description="This creates an employee record, user account, and leave balances atomically."
        confirmLabel="Convert"
        onConfirm={() => convertMutation.mutate()}
        onCancel={() => setConvertOpen(false)}
        isLoading={convertMutation.isPending}
      />

      <Dialog open={sendBackOpen} onOpenChange={setSendBackOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send back to candidate</DialogTitle>
            <DialogDescription>Describe what the candidate needs to correct (min 10 characters).</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="send-back-reason">Reason</Label>
            <Textarea
              id="send-back-reason"
              value={sendBackReason}
              onChange={(event) => setSendBackReason(event.target.value)}
              rows={4}
            />
          </div>
          <Button
            className="mt-4"
            disabled={sendBackReason.length < 10 || sendBackMutation.isPending}
            onClick={() => sendBackMutation.mutate()}
          >
            Send Back
          </Button>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
