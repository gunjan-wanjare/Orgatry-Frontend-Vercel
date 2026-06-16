import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionCard } from '@/components/shared/SectionCard';
import { DesignationAutocomplete } from '@/modules/mailers-and-docs/DesignationAutocomplete';
import {
  designationApi,
  type DesignationTemplate,
} from '@/services/api/designation.api';
import { getErrorMessage } from '@/lib/errors';

function createEmptyResponsibility() {
  return '';
}

export function DesignationDocumentEditor() {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [responsibilities, setResponsibilities] = useState<string[]>([
    createEmptyResponsibility(),
  ]);

  const saveMutation = useMutation({
    mutationFn: () =>
      designationApi.createDocument({
        title: title.trim(),
        designation: designation.trim(),
        department: department.trim(),
        responsibilities: responsibilities
          .map((item) => item.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      toast.success('Document snapshot saved');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const visibleResponsibilities = useMemo(
    () => responsibilities.filter((item) => item.trim().length > 0),
    [responsibilities],
  );

  const handleSelectTemplate = (template: DesignationTemplate) => {
    setDepartment(template.department);
    setResponsibilities(
      template.responsibilities.length > 0
        ? [...template.responsibilities]
        : [createEmptyResponsibility()],
    );
  };

  const updateResponsibility = (index: number, value: string) => {
    setResponsibilities((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const addResponsibility = () => {
    setResponsibilities((prev) => [...prev, createEmptyResponsibility()]);
  };

  const removeResponsibility = (index: number) => {
    setResponsibilities((prev) => {
      if (prev.length <= 1) {
        return [createEmptyResponsibility()];
      }
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
  };

  const canSave =
    title.trim().length > 0 &&
    designation.trim().length > 0 &&
    department.trim().length > 0 &&
    responsibilities.some((item) => item.trim().length > 0);

  return (
    <SectionCard
      title="Designation document editor"
      description="Compose a designation brief with live preview. Selecting a template pre-fills department and responsibilities; you can still edit everything freely."
    >
      <div className="grid min-h-[640px] gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border border-border bg-slate-950/30 p-5">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Document title</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Offer letter — Senior Backend Engineer"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Designation</span>
            <DesignationAutocomplete
              value={designation}
              onChange={setDesignation}
              onSelectTemplate={handleSelectTemplate}
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-foreground">Department</span>
            <Input
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              placeholder="e.g. Engineering"
            />
          </label>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Responsibilities
              </span>
              <Button type="button" size="sm" variant="outline" onClick={addResponsibility}>
                <Plus className="size-3.5" /> Add
              </Button>
            </div>

            <div className="space-y-2">
              {responsibilities.map((responsibility, index) => (
                <div key={`responsibility-${index}`} className="flex gap-2">
                  <Input
                    value={responsibility}
                    onChange={(event) =>
                      updateResponsibility(index, event.target.value)
                    }
                    placeholder={`Responsibility ${index + 1}`}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="shrink-0 text-rose-400 hover:text-rose-300"
                    onClick={() => removeResponsibility(index)}
                    title="Remove"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <Button
            className="w-full"
            disabled={!canSave || saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Saving…
              </>
            ) : (
              <>
                <Save className="size-4" /> Save document snapshot
              </>
            )}
          </Button>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-2 text-xs text-muted-foreground">Live preview</p>
          <article className="mx-auto min-h-[560px] max-w-[640px] rounded-sm border border-neutral-200 bg-white px-10 py-12 text-neutral-900 shadow-2xl shadow-black/20">
            <header className="border-b border-neutral-300 pb-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500">
                IITIL
              </p>
              <h1 className="mt-3 text-2xl font-serif font-semibold tracking-tight">
                {title.trim() || 'Document title'}
              </h1>
            </header>

            <section className="mt-8 space-y-6 text-sm leading-relaxed">
              <div className="grid gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Designation
                </p>
                <p className="text-base font-medium">
                  {designation.trim() || '—'}
                </p>
              </div>

              <div className="grid gap-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Department
                </p>
                <p className="text-base font-medium">
                  {department.trim() || '—'}
                </p>
              </div>

              <div className="grid gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Key responsibilities
                </p>
                {visibleResponsibilities.length > 0 ? (
                  <ol className="list-decimal space-y-2 pl-5">
                    {visibleResponsibilities.map((item, index) => (
                      <li key={`preview-${index}`}>{item}</li>
                    ))}
                  </ol>
                ) : (
                  <p className="text-neutral-400 italic">
                    Responsibilities will appear here as you type.
                  </p>
                )}
              </div>
            </section>

            <footer className="mt-12 border-t border-neutral-200 pt-4 text-xs text-neutral-500">
              Internal document · {new Date().toLocaleDateString()}
            </footer>
          </article>
        </div>
      </div>
    </SectionCard>
  );
}
