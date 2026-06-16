import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Banknote,
  CheckCircle2,
  Contact,
  FileUp,
  Fingerprint,
  Loader2,
  Phone,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/animations/PageTransition';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SectionCard } from '@/components/shared/SectionCard';
import { cn } from '@/lib/utils';
import { endpoints } from '@/services/api/endpoints';
import { httpClient } from '@/services/api/http-client';
import { getErrorMessage } from '@/lib/errors';
import type { ApiResponse } from '@/types/api';

type PortalPayload = {
  record: {
    id: string;
    status: string;
    personal?: Record<string, unknown> | null;
    contact?: Record<string, unknown> | null;
    identity?: Record<string, unknown> | null;
    bankDetails?: Record<string, unknown> | null;
    emergencyContacts?: Array<Record<string, unknown>>;
    documents?: Array<{ id: string; documentType: string; fileUrl: string }>;
  };
  locked: boolean;
};

const STEPS = [
  { key: 'personal', label: 'Personal', icon: UserRound },
  { key: 'contact', label: 'Contact', icon: Contact },
  { key: 'identity', label: 'Identity', icon: Fingerprint },
  { key: 'bank', label: 'Bank', icon: Banknote },
  { key: 'emergency', label: 'Emergency', icon: Phone },
  { key: 'documents', label: 'Documents', icon: FileUp },
] as const;

type StepKey = (typeof STEPS)[number]['key'];

const MANDATORY_DOCS = ['AADHAAR_CARD', 'PAN_CARD', 'PASSPORT_SIZE_PHOTO'];

function useDebouncedSave(delayMs: number) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    (saveFn: () => Promise<void>, onStatus: (status: 'saving' | 'saved' | 'idle') => void) => {
      if (timer.current) clearTimeout(timer.current);
      onStatus('idle');
      timer.current = setTimeout(async () => {
        onStatus('saving');
        try {
          await saveFn();
          onStatus('saved');
        } catch {
          onStatus('idle');
        }
      }, delayMs);
    },
    [delayMs],
  );
}

export function PreOnboardingPortalPage() {
  const { token = '' } = useParams();
  const [activeStep, setActiveStep] = useState<StepKey>('personal');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const debouncedSave = useDebouncedSave(2000);

  const [personal, setPersonal] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    maritalStatus: '',
    nationality: 'Indian',
    bloodGroup: '',
  });
  const [contact, setContact] = useState({
    personalEmail: '',
    mobileNumber: '',
    currentAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
    permanentAddress: { street: '', city: '', state: '', pincode: '', country: 'India' },
    sameAsCurrent: false,
  });
  const [identity, setIdentity] = useState({ panNumber: '', aadhaarNumber: '', passportNumber: '' });
  const [bank, setBank] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    branch: '',
    ifscCode: '',
  });
  const [emergency, setEmergency] = useState([{ name: '', relationship: '', mobileNumber: '' }]);

  const portalQuery = useQuery({
    queryKey: ['onboarding-portal', token],
    queryFn: async () => {
      const response = await httpClient.get<ApiResponse<PortalPayload>>(endpoints.preOnboarding.portal(token));
      return response.data.data;
    },
    enabled: Boolean(token),
    retry: false,
  });

  const locked = portalQuery.data?.locked ?? false;
  const record = portalQuery.data?.record;

  useEffect(() => {
    if (!record) return;
    if (record.personal) {
      const p = record.personal as Record<string, string>;
      setPersonal({
        firstName: p.firstName ?? '',
        lastName: p.lastName ?? '',
        gender: p.gender ?? '',
        dob: p.dob ? String(p.dob).slice(0, 10) : '',
        maritalStatus: p.maritalStatus ?? '',
        nationality: p.nationality ?? 'Indian',
        bloodGroup: p.bloodGroup ?? '',
      });
    }
    if (record.contact) {
      const c = record.contact as Record<string, unknown>;
      setContact({
        personalEmail: String(c.personalEmail ?? ''),
        mobileNumber: String(c.mobileNumber ?? ''),
        currentAddress: (c.currentAddress as typeof contact.currentAddress) ?? contact.currentAddress,
        permanentAddress: (c.permanentAddress as typeof contact.permanentAddress) ?? contact.permanentAddress,
        sameAsCurrent: false,
      });
    }
    if (record.emergencyContacts?.length) {
      setEmergency(
        record.emergencyContacts.map((entry) => ({
          name: String(entry.name ?? ''),
          relationship: String(entry.relationship ?? ''),
          mobileNumber: String(entry.mobileNumber ?? ''),
        })),
      );
    }
  }, [record]);

  const savePersonal = useMutation({
    mutationFn: async () => {
      await httpClient.put(endpoints.preOnboarding.portalPersonal(token), personal);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveContact = useMutation({
    mutationFn: async () => {
      await httpClient.put(endpoints.preOnboarding.portalContact(token), {
        personalEmail: contact.personalEmail,
        mobileNumber: contact.mobileNumber,
        currentAddress: contact.currentAddress,
        permanentAddress: contact.sameAsCurrent ? contact.currentAddress : contact.permanentAddress,
      });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveIdentity = useMutation({
    mutationFn: async () => {
      await httpClient.put(endpoints.preOnboarding.portalIdentity(token), identity);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveBank = useMutation({
    mutationFn: async () => {
      await httpClient.put(endpoints.preOnboarding.portalBank(token), bank);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveEmergency = useMutation({
    mutationFn: async () => {
      await httpClient.put(endpoints.preOnboarding.portalEmergency(token), { contacts: emergency });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const uploadDocument = useMutation({
    mutationFn: async (input: { file: File; documentType: string }) => {
      const formData = new FormData();
      formData.append('file', input.file);
      formData.append('documentType', input.documentType);
      await httpClient.post(endpoints.preOnboarding.portalDocuments(token), formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      toast.success('Document uploaded');
      portalQuery.refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      await httpClient.post(endpoints.preOnboarding.portalSubmit(token));
    },
    onSuccess: () => {
      toast.success('Submitted for HR verification');
      portalQuery.refetch();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const triggerAutoSave = (step: StepKey) => {
    if (locked) return;
    const handlers: Record<StepKey, () => Promise<void>> = {
      personal: () => savePersonal.mutateAsync(),
      contact: () => saveContact.mutateAsync(),
      identity: () => saveIdentity.mutateAsync(),
      bank: () => saveBank.mutateAsync(),
      emergency: () => saveEmergency.mutateAsync(),
      documents: async () => {},
    };
    debouncedSave(handlers[step], setSaveStatus);
  };

  const completionPercent = useMemo(() => {
    let completed = 0;
    if (record?.personal) completed += 1;
    if (record?.contact) completed += 1;
    if (record?.identity) completed += 1;
    if (record?.bankDetails) completed += 1;
    if (record?.emergencyContacts?.length) completed += 1;
    const uploaded = new Set(record?.documents?.map((doc) => doc.documentType) ?? []);
    if (MANDATORY_DOCS.every((type) => uploaded.has(type))) completed += 1;
    return Math.round((completed / 6) * 100);
  }, [record]);

  if (portalQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (portalQuery.isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
        <h1 className="text-xl font-semibold">Portal link unavailable</h1>
        <p className="max-w-md text-muted-foreground">
          This link is invalid or has expired. Please contact HR for a new onboarding link.
        </p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto min-h-screen max-w-4xl px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Candidate Pre-Onboarding</h1>
          <p className="mt-1 text-muted-foreground">Complete all sections before your joining date.</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <Badge variant="secondary">{record?.status?.replace(/_/g, ' ') ?? 'PENDING'}</Badge>
            <Badge variant="outline">{completionPercent}% complete</Badge>
            {saveStatus === 'saving' ? <span className="text-xs text-muted-foreground">Saving…</span> : null}
            {saveStatus === 'saved' ? <span className="text-xs text-emerald-600">Saved</span> : null}
            {locked ? <Badge variant="destructive">Read-only — under verification</Badge> : null}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Button
                key={step.key}
                variant={activeStep === step.key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveStep(step.key)}
              >
                <Icon className="mr-1 h-4 w-4" />
                {step.label}
              </Button>
            );
          })}
        </div>

        <SectionCard title={STEPS.find((step) => step.key === activeStep)?.label ?? 'Form'}>
          {activeStep === 'personal' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {(['firstName', 'lastName', 'gender', 'dob', 'maritalStatus', 'nationality', 'bloodGroup'] as const).map(
                (field) => (
                  <div key={field} className={cn(field === 'dob' ? '' : '')}>
                    <Label htmlFor={field}>{field.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input
                      id={field}
                      type={field === 'dob' ? 'date' : 'text'}
                      disabled={locked}
                      value={personal[field]}
                      onChange={(event) => {
                        setPersonal((prev) => ({ ...prev, [field]: event.target.value }));
                        triggerAutoSave('personal');
                      }}
                    />
                  </div>
                ),
              )}
            </div>
          ) : null}

          {activeStep === 'contact' ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Personal Email</Label>
                  <Input
                    disabled={locked}
                    value={contact.personalEmail}
                    onChange={(event) => {
                      setContact((prev) => ({ ...prev, personalEmail: event.target.value }));
                      triggerAutoSave('contact');
                    }}
                  />
                </div>
                <div>
                  <Label>Mobile</Label>
                  <Input
                    disabled={locked}
                    value={contact.mobileNumber}
                    onChange={(event) => {
                      setContact((prev) => ({ ...prev, mobileNumber: event.target.value }));
                      triggerAutoSave('contact');
                    }}
                  />
                </div>
              </div>
              <p className="text-sm font-medium">Current Address</p>
              <div className="grid gap-3 md:grid-cols-2">
                {(['street', 'city', 'state', 'pincode', 'country'] as const).map((field) => (
                  <div key={field}>
                    <Label>{field}</Label>
                    <Input
                      disabled={locked}
                      value={contact.currentAddress[field]}
                      onChange={(event) => {
                        setContact((prev) => ({
                          ...prev,
                          currentAddress: { ...prev.currentAddress, [field]: event.target.value },
                        }));
                        triggerAutoSave('contact');
                      }}
                    />
                  </div>
                ))}
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  disabled={locked}
                  checked={contact.sameAsCurrent}
                  onChange={(event) => {
                    setContact((prev) => ({ ...prev, sameAsCurrent: event.target.checked }));
                    triggerAutoSave('contact');
                  }}
                />
                Permanent address same as current
              </label>
            </div>
          ) : null}

          {activeStep === 'identity' ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>PAN Number</Label>
                <Input
                  disabled={locked}
                  value={identity.panNumber}
                  onChange={(event) => {
                    setIdentity((prev) => ({ ...prev, panNumber: event.target.value.toUpperCase() }));
                    triggerAutoSave('identity');
                  }}
                />
              </div>
              <div>
                <Label>Aadhaar Number</Label>
                <Input
                  disabled={locked}
                  value={identity.aadhaarNumber}
                  onChange={(event) => {
                    setIdentity((prev) => ({ ...prev, aadhaarNumber: event.target.value }));
                    triggerAutoSave('identity');
                  }}
                />
              </div>
              <div>
                <Label>Passport (optional)</Label>
                <Input
                  disabled={locked}
                  value={identity.passportNumber}
                  onChange={(event) => {
                    setIdentity((prev) => ({ ...prev, passportNumber: event.target.value }));
                    triggerAutoSave('identity');
                  }}
                />
              </div>
            </div>
          ) : null}

          {activeStep === 'bank' ? (
            <div className="grid gap-4 md:grid-cols-2">
              {(['accountHolderName', 'accountNumber', 'bankName', 'branch', 'ifscCode'] as const).map((field) => (
                <div key={field}>
                  <Label>{field.replace(/([A-Z])/g, ' $1')}</Label>
                  <Input
                    disabled={locked}
                    value={bank[field]}
                    onChange={(event) => {
                      setBank((prev) => ({
                        ...prev,
                        [field]: field === 'ifscCode' ? event.target.value.toUpperCase() : event.target.value,
                      }));
                      triggerAutoSave('bank');
                    }}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {activeStep === 'emergency' ? (
            <div className="space-y-4">
              {emergency.map((entry, index) => (
                <div key={index} className="grid gap-3 rounded-md border p-3 md:grid-cols-3">
                  {(['name', 'relationship', 'mobileNumber'] as const).map((field) => (
                    <div key={field}>
                      <Label>{field}</Label>
                      <Input
                        disabled={locked}
                        value={entry[field]}
                        onChange={(event) => {
                          setEmergency((prev) =>
                            prev.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, [field]: event.target.value } : item,
                            ),
                          );
                          triggerAutoSave('emergency');
                        }}
                      />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : null}

          {activeStep === 'documents' ? (
            <div className="space-y-4">
              {MANDATORY_DOCS.map((documentType) => {
                const uploaded = record?.documents?.find((doc) => doc.documentType === documentType);
                return (
                  <div key={documentType} className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-3">
                    <div>
                      <p className="font-medium">{documentType.replace(/_/g, ' ')}</p>
                      {uploaded ? (
                        <a href={uploaded.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                          View uploaded file
                        </a>
                      ) : (
                        <p className="text-xs text-muted-foreground">Required</p>
                      )}
                    </div>
                    <Input
                      type="file"
                      disabled={locked || uploadDocument.isPending}
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="max-w-xs"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) uploadDocument.mutate({ file, documentType });
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ) : null}
        </SectionCard>

        {!locked && record?.status === 'PENDING_DOCUMENTS' ? (
          <div className="mt-6 flex justify-end">
            <Button disabled={submitMutation.isPending} onClick={() => submitMutation.mutate()}>
              {submitMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Submit for Verification
            </Button>
          </div>
        ) : null}
      </div>
    </PageTransition>
  );
}
