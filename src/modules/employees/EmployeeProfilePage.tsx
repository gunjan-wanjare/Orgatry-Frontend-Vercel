import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Eye, FileUp, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/animations/PageTransition';
import { PageHeader } from '@/components/shared/PageHeader';
import { SectionCard } from '@/components/shared/SectionCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { employeeApi } from '@/services/api/employee.api';
import { getErrorMessage } from '@/lib/errors';
import { usePermissions } from '@/hooks/use-permissions';
import { permissions } from '@/constants/permissions';
import { useAuthStore } from '@/store/auth.store';

const TAB_KEYS = ['overview', 'personal', 'contact', 'employment', 'documents', 'bank', 'emergency'] as const;
type TabKey = (typeof TAB_KEYS)[number];

type EmergencyContact = { name: string; relationship: string; mobileNumber: string };

export function EmployeeProfilePage() {
  const { id = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const currentUser = useAuthStore((state) => state.user);

  const activeTab = (searchParams.get('tab') as TabKey) || 'overview';
  const canEditHr = can(permissions.employeeWrite) || can(permissions.employeeUserManage);
  const isSelf = currentUser?.employeeId === id;
  const canEditPersonal = canEditHr || isSelf;

  const profileQuery = useQuery({
    queryKey: ['employee-profile', id],
    queryFn: () => employeeApi.getProfile(id),
    enabled: Boolean(id),
  });

  const profile = profileQuery.data as Record<string, unknown> | undefined;

  const [personal, setPersonal] = useState({ firstName: '', lastName: '', gender: '', dob: '', maritalStatus: '', nationality: '', bloodGroup: '' });
  const [contact, setContact] = useState({ personalEmail: '', mobileNumber: '', currentAddress: '', permanentAddress: '' });
  const [employment, setEmployment] = useState({ designation: '', department: '', workLocation: '', status: '', noticePeriodDays: '' });
  const [emergency, setEmergency] = useState<EmergencyContact[]>([{ name: '', relationship: '', mobileNumber: '' }]);
  const [bankForm, setBankForm] = useState({ accountHolderName: '', accountNumber: '', bankName: '', branch: '', ifscCode: '' });
  const [rejectRemarks, setRejectRemarks] = useState('');

  useEffect(() => {
    if (!profile) return;
    setPersonal({
      firstName: String(profile.firstName ?? ''),
      lastName: String(profile.lastName ?? ''),
      gender: String(profile.gender ?? ''),
      dob: profile.dob ? String(profile.dob).slice(0, 10) : '',
      maritalStatus: String(profile.maritalStatus ?? ''),
      nationality: String(profile.nationality ?? ''),
      bloodGroup: String(profile.bloodGroup ?? ''),
    });
    setContact({
      personalEmail: String(profile.personalEmail ?? ''),
      mobileNumber: String(profile.mobileNumber ?? profile.phone ?? ''),
      currentAddress: JSON.stringify(profile.currentAddress ?? profile.address ?? {}, null, 2),
      permanentAddress: JSON.stringify(profile.permanentAddress ?? {}, null, 2),
    });
    setEmployment({
      designation: String(profile.designation ?? ''),
      department: String(profile.department ?? ''),
      workLocation: String(profile.workLocation ?? ''),
      status: String(profile.status ?? ''),
      noticePeriodDays: String(profile.noticePeriodDays ?? ''),
    });
    const contacts = Array.isArray(profile.emergencyContacts) ? profile.emergencyContacts as EmergencyContact[] : [];
    if (contacts.length) setEmergency(contacts);
  }, [profile]);

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['employee-profile', id] });

  const savePersonal = useMutation({
    mutationFn: () => employeeApi.updatePersonal(id, personal),
    onSuccess: () => { toast.success('Personal info saved'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveContact = useMutation({
    mutationFn: () => employeeApi.updateContact(id, {
      personalEmail: contact.personalEmail,
      mobileNumber: contact.mobileNumber,
      currentAddress: JSON.parse(contact.currentAddress || '{}'),
      permanentAddress: JSON.parse(contact.permanentAddress || '{}'),
    }),
    onSuccess: () => { toast.success('Contact info saved'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveEmployment = useMutation({
    mutationFn: () => employeeApi.updateEmployment(id, {
      ...employment,
      noticePeriodDays: employment.noticePeriodDays ? Number(employment.noticePeriodDays) : undefined,
    }),
    onSuccess: () => { toast.success('Employment info saved'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const saveEmergency = useMutation({
    mutationFn: () => employeeApi.updateEmergency(id, { contacts: emergency }),
    onSuccess: () => { toast.success('Emergency contacts saved'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const revealSensitive = useMutation({
    mutationFn: () => employeeApi.revealSensitive(id),
    onSuccess: () => { toast.success('Sensitive fields revealed (audit logged)'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const submitBankChange = useMutation({
    mutationFn: () => employeeApi.submitBankChangeRequest(id, bankForm),
    onSuccess: () => { toast.success('Bank change request submitted'); setBankForm({ accountHolderName: '', accountNumber: '', bankName: '', branch: '', ifscCode: '' }); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const approveBankChange = useMutation({
    mutationFn: (reqId: string) => employeeApi.approveBankChangeRequest(id, reqId),
    onSuccess: () => { toast.success('Bank change approved'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const rejectBankChange = useMutation({
    mutationFn: (reqId: string) => employeeApi.rejectBankChangeRequest(id, reqId, rejectRemarks),
    onSuccess: () => { toast.success('Bank change rejected'); setRejectRemarks(''); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const uploadDocument = useMutation({
    mutationFn: ({ file, documentType }: { file: File; documentType: string }) => employeeApi.uploadDocument(id, file, documentType),
    onSuccess: () => { toast.success('Document uploaded'); invalidate(); },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const bankDetails = profile?.bankDetails as Record<string, unknown> | null | undefined;
  const bankRequests = (profile?.bankChangeRequests as Array<Record<string, unknown>> | undefined) ?? [];
  const documents = (profile?.employeeDocuments as Array<Record<string, unknown>> | undefined) ?? [];
  const manager = profile?.reportingManager as Record<string, unknown> | null | undefined;
  const pendingBankRequest = bankRequests.find((item) => item.status === 'PENDING');

  const fullName = useMemo(
    () => `${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`.trim(),
    [profile?.firstName, profile?.lastName],
  );

  const setTab = (tab: string) => {
    setSearchParams({ tab });
  };

  if (profileQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="outline" asChild><Link to="/employees"><ArrowLeft className="mr-2 h-4 w-4" />Back</Link></Button>
        <p className="text-muted-foreground">Employee profile not found or access denied.</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Employee Profile"
          title={fullName || String(profile.employeeId ?? 'Employee')}
          description={`${String(profile.employeeId ?? '')} · ${String(profile.department ?? '')}`}
          actions={
            <Button variant="outline" asChild>
              <Link to="/employees"><ArrowLeft className="mr-2 h-4 w-4" />Back to list</Link>
            </Button>
          }
        />

        <Tabs value={activeTab} onValueChange={setTab}>
          <TabsList className="flex h-auto flex-wrap">
            {TAB_KEYS.map((tab) => (
              <TabsTrigger key={tab} value={tab} className="capitalize">{tab}</TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-4">
            <SectionCard title="Overview">
              <div className="grid gap-4 md:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Employee ID</p><p className="font-medium">{String(profile.employeeId)}</p></div>
                <div><p className="text-sm text-muted-foreground">Status</p><Badge>{String(profile.status)}</Badge></div>
                <div><p className="text-sm text-muted-foreground">Designation</p><p>{String(profile.designation)}</p></div>
                <div><p className="text-sm text-muted-foreground">Department</p><p>{String(profile.department)}</p></div>
                <div><p className="text-sm text-muted-foreground">Work email</p><p>{String(profile.email)}</p></div>
                <div><p className="text-sm text-muted-foreground">Joining date</p><p>{profile.joiningDate ? String(profile.joiningDate).slice(0, 10) : '—'}</p></div>
                <div><p className="text-sm text-muted-foreground">Reporting manager</p><p>{manager ? `${manager.firstName} ${manager.lastName}` : '—'}</p></div>
                <div><p className="text-sm text-muted-foreground">Employment type</p><p>{String(profile.employmentType ?? '—')}</p></div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="personal" className="mt-4">
            <SectionCard title="Personal Information">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(personal).map(([key, value]) => (
                  <div key={key}>
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input type={key === 'dob' ? 'date' : 'text'} disabled={!canEditPersonal} value={value} onChange={(event) => setPersonal((prev) => ({ ...prev, [key]: event.target.value }))} />
                  </div>
                ))}
              </div>
              {canEditPersonal ? (
                <Button className="mt-4" disabled={savePersonal.isPending} onClick={() => savePersonal.mutate()}>
                  {savePersonal.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              ) : null}
            </SectionCard>
          </TabsContent>

          <TabsContent value="contact" className="mt-4">
            <SectionCard title="Contact Information">
              <div className="grid gap-4">
                <div><Label>Work email</Label><Input disabled value={String(profile.email)} /></div>
                <div><Label>Personal email</Label><Input disabled={!canEditPersonal} value={contact.personalEmail} onChange={(event) => setContact((prev) => ({ ...prev, personalEmail: event.target.value }))} /></div>
                <div><Label>Mobile</Label><Input disabled={!canEditPersonal} value={contact.mobileNumber} onChange={(event) => setContact((prev) => ({ ...prev, mobileNumber: event.target.value }))} /></div>
                <div><Label>Current address (JSON)</Label><Textarea disabled={!canEditPersonal} rows={4} value={contact.currentAddress} onChange={(event) => setContact((prev) => ({ ...prev, currentAddress: event.target.value }))} /></div>
                <div><Label>Permanent address (JSON)</Label><Textarea disabled={!canEditPersonal} rows={4} value={contact.permanentAddress} onChange={(event) => setContact((prev) => ({ ...prev, permanentAddress: event.target.value }))} /></div>
              </div>
              {canEditPersonal ? (
                <Button className="mt-4" disabled={saveContact.isPending} onClick={() => saveContact.mutate()}>
                  Save contact
                </Button>
              ) : null}
            </SectionCard>
          </TabsContent>

          <TabsContent value="employment" className="mt-4">
            <SectionCard title="Employment Information">
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(employment).map(([key, value]) => (
                  <div key={key}>
                    <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                    <Input disabled={!canEditHr} value={value} onChange={(event) => setEmployment((prev) => ({ ...prev, [key]: event.target.value }))} />
                  </div>
                ))}
              </div>
              {canEditHr ? (
                <Button className="mt-4" disabled={saveEmployment.isPending} onClick={() => saveEmployment.mutate()}>
                  Save employment
                </Button>
              ) : null}
            </SectionCard>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <SectionCard title="Documents">
              <div className="space-y-3">
                {documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded yet.</p> : null}
                {documents.map((document) => (
                  <div key={String(document.id)} className="flex items-center justify-between rounded-md border p-3 text-sm">
                    <span>{String(document.documentType)} · v{String(document.version ?? 1)}</span>
                    <a href={String(document.fileUrl)} target="_blank" rel="noreferrer" className="text-primary underline">Preview</a>
                  </div>
                ))}
              </div>
              {canEditPersonal ? (
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) uploadDocument.mutate({ file, documentType: 'OTHER' });
                  }} />
                  <FileUp className="h-4 w-4 text-muted-foreground" />
                </div>
              ) : null}
            </SectionCard>
          </TabsContent>

          <TabsContent value="bank" className="mt-4">
            <SectionCard title="Bank Details">
              <div className="mb-4 grid gap-3 md:grid-cols-2">
                <div><p className="text-sm text-muted-foreground">Account holder</p><p>{String(bankDetails?.accountHolderName ?? '—')}</p></div>
                <div><p className="text-sm text-muted-foreground">Account number</p><p>{String(bankDetails?.accountNumber ?? '—')}</p></div>
                <div><p className="text-sm text-muted-foreground">Bank</p><p>{String(bankDetails?.bankName ?? '—')}</p></div>
                <div><p className="text-sm text-muted-foreground">IFSC</p><p>{String(bankDetails?.ifscCode ?? '—')}</p></div>
              </div>

              {can(permissions.employeeUserManage) ? (
                <Button variant="outline" size="sm" disabled={revealSensitive.isPending} onClick={() => revealSensitive.mutate()}>
                  <Eye className="mr-2 h-4 w-4" />Reveal full details (audit logged)
                </Button>
              ) : null}

              {(isSelf || canEditHr) && !pendingBankRequest ? (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <p className="text-sm font-medium">Submit bank change request</p>
                  {(['accountHolderName', 'accountNumber', 'bankName', 'branch', 'ifscCode'] as const).map((field) => (
                    <div key={field}>
                      <Label className="capitalize">{field.replace(/([A-Z])/g, ' $1')}</Label>
                      <Input value={bankForm[field]} onChange={(event) => setBankForm((prev) => ({ ...prev, [field]: event.target.value }))} />
                    </div>
                  ))}
                  <Button disabled={submitBankChange.isPending} onClick={() => submitBankChange.mutate()}>Submit change request</Button>
                </div>
              ) : null}

              {pendingBankRequest && canEditHr ? (
                <div className="mt-6 space-y-3 border-t pt-4">
                  <p className="text-sm font-medium">Pending change request</p>
                  <pre className="rounded-md bg-muted p-3 text-xs">{JSON.stringify(pendingBankRequest.proposedDetails, null, 2)}</pre>
                  <Textarea placeholder="Reject remarks (min 10 chars)" value={rejectRemarks} onChange={(event) => setRejectRemarks(event.target.value)} />
                  <div className="flex gap-2">
                    <Button onClick={() => approveBankChange.mutate(String(pendingBankRequest.id))}>Approve</Button>
                    <Button variant="destructive" disabled={rejectRemarks.length < 10} onClick={() => rejectBankChange.mutate(String(pendingBankRequest.id))}>Reject</Button>
                  </div>
                </div>
              ) : null}

              {bankRequests.length > 0 ? (
                <div className="mt-6 space-y-2">
                  <p className="text-sm font-medium">Request history</p>
                  {bankRequests.map((item) => (
                    <div key={String(item.id)} className="rounded-md border p-2 text-xs">
                      {String(item.status)} · {String(item.createdAt).slice(0, 10)}
                    </div>
                  ))}
                </div>
              ) : null}
            </SectionCard>
          </TabsContent>

          <TabsContent value="emergency" className="mt-4">
            <SectionCard title="Emergency Contacts">
              {emergency.map((entry, index) => (
                <div key={index} className="mb-4 grid gap-3 md:grid-cols-3">
                  {(['name', 'relationship', 'mobileNumber'] as const).map((field) => (
                    <div key={field}>
                      <Label className="capitalize">{field}</Label>
                      <Input disabled={!canEditPersonal} value={entry[field]} onChange={(event) => setEmergency((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: event.target.value } : item))} />
                    </div>
                  ))}
                </div>
              ))}
              {canEditPersonal ? (
                <Button disabled={saveEmergency.isPending} onClick={() => saveEmergency.mutate()}>Save contacts</Button>
              ) : null}
            </SectionCard>
          </TabsContent>
        </Tabs>
      </div>
    </PageTransition>
  );
}
