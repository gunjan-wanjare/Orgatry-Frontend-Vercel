import {
  ArrowLeft,
  CalendarIcon,
  Download,
  Eye,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SectionCard } from "@/components/shared/SectionCard";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { endpoints } from "@/services/api/endpoints";
import { resourceApi } from "@/services/api/resource.api";
import { httpClient } from "@/services/api/http-client";
import type { ApiResponse } from "@/types/api";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/tables/DataTable";
import { useResourceQuery } from "@/hooks/use-resource-query";
import { getErrorMessage } from "@/lib/errors";
import { cn } from "@/lib/utils";
import {
  A4_HEIGHT_PX,
  A4_WIDTH_PX,
  PageBreakOverlay,
} from "./PageBreakOverlay";
import {
  applyFormulas,
  buildDocumentPdfFilename,
  buildOfferDocument,
  downloadOfferLetterPdf,
  downloadPreviewHtmlAsPdf,
  getComputedVariableNames,
  offerStatusBadgeVariant,
  OFFER_STATUS_LABELS,
  stripScriptsForPreview,
} from "./offer-letter.utils";

type Template = {
  id: string;
  name: string;
  key: string;
  variables: string[];
  formulas?: Record<string, string>;
  isDefault: boolean;
  htmlContent: string;
  cssContent?: string;
  currentVersion?: number;
};

type OfferLetter = {
  id: string;
  templateId: string;
  template: { id: string; name: string; key: string; currentVersion?: number };
  templateVersion?: { id: string; version: number; name: string } | null;
  recipientName?: string | null;
  recipientEmail?: string | null;
  createdBy?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
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

type Step = "form" | "preview";

type DocumentsTabProps = {
  triggerGenerate: boolean;
  onGenerateHandled: () => void;
};

export function DocumentsTab({
  triggerGenerate,
  onGenerateHandled,
}: DocumentsTabProps) {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState<OfferLetter | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<OfferLetter | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [previewHtml, setPreviewHtml] = useState("");
  const [generatedOffer, setGeneratedOffer] = useState<GenerateResult | null>(
    null,
  );
  const [downloading, setDownloading] = useState(false);
  const [mobileTab, setMobileTab] = useState<"variables" | "preview">(
    "variables",
  );

  const listQuery = useResourceQuery<OfferLetter>(
    "offer-letters",
    endpoints.offerLetters,
    {
      page,
      limit: 25,
    },
  );
  const offerLetters = listQuery.data?.items ?? [];
  const totalPages = listQuery.data?.meta.totalPages ?? 1;

  const templatesQuery = useQuery({
    queryKey: ["templates-list"],
    queryFn: () =>
      resourceApi.list<Template>(endpoints.templates, { page: 1, limit: 100 }),
  });
  const templates = templatesQuery.data?.items ?? [];
  const selectedTemplate = templates.find(
    (template) => template.id === selectedTemplateId,
  );

  useEffect(() => {
    if (!triggerGenerate) return;
    openGenerate();
    onGenerateHandled();
  }, [triggerGenerate]);

  useEffect(() => {
    if (!selectedTemplate) return;
    setValues((prev) => {
      const next: Record<string, string> = {};
      for (const variable of selectedTemplate.variables) {
        next[variable] = prev[variable] ?? "";
      }
      return next;
    });
  }, [selectedTemplateId, selectedTemplate]);

  useEffect(() => {
    if (!selectedTemplate || step !== "form") return;
    const formulas = selectedTemplate.formulas ?? {};
    const computed =
      Object.keys(formulas).length > 0
        ? applyFormulas(values, formulas)
        : values;
    setPreviewHtml(
      stripScriptsForPreview(
        buildOfferDocument(
          selectedTemplate.htmlContent,
          selectedTemplate.cssContent ?? "",
          computed,
        ),
      ),
    );
  }, [values, selectedTemplate, step]);

  const generateMutation = useMutation({
    mutationFn: () => {
      const computedVars = selectedTemplate?.formulas
        ? applyFormulas(values, selectedTemplate.formulas)
        : values;

      return httpClient.post<ApiResponse<GenerateResult>>(
        endpoints.offerLetterGenerate,
        {
          templateId: selectedTemplateId,
          recipientName,
          recipientEmail,
          variables: computedVars,
        },
      );
    },
    onSuccess: (res) => {
      const data = res.data.data;
      setGeneratedOffer(data);
      setPreviewHtml(stripScriptsForPreview(data.generatedHtml));
      setStep("preview");
      toast.success("Document generated");
      void queryClient.invalidateQueries({ queryKey: ["offer-letters"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      httpClient.delete(endpoints.offerLetterDetail(id)),
    onSuccess: () => {
      toast.success("Document deleted");
      setDeleteTarget(null);
      setDetailOffer(null);
      void queryClient.invalidateQueries({ queryKey: ["offer-letters"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      httpClient.patch(endpoints.offerLetterStatus(id), { status }),
    onSuccess: (res) => {
      toast.success("Status updated");
      setDetailOffer(res.data.data as OfferLetter);
      void queryClient.invalidateQueries({ queryKey: ["offer-letters"] });
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const allFilled = useMemo(() => {
    const formulas = selectedTemplate?.formulas ?? {};
    const computedNames = getComputedVariableNames(formulas);
    const inputVars =
      selectedTemplate?.variables.filter((v) => !computedNames.has(v)) ?? [];
    return inputVars.every((v) => values[v]?.trim());
  }, [selectedTemplate, values]);

  function openGenerate(cloneFrom?: OfferLetter) {
    setStep("form");
    setGeneratedOffer(null);
    setPreviewHtml("");
    setMobileTab("variables");
    if (cloneFrom) {
      setSelectedTemplateId(cloneFrom.templateId);
      setRecipientName(cloneFrom.recipientName ?? "");
      setRecipientEmail(cloneFrom.recipientEmail ?? "");
      setValues({ ...cloneFrom.variables });
    } else {
      const defaultTemplate = templates.find((template) => template.isDefault);
      setSelectedTemplateId(defaultTemplate?.id ?? "");
      setRecipientName("");
      setRecipientEmail("");
      setValues({});
    }
    setGenerateOpen(true);
  }

  function closeGenerate() {
    setGenerateOpen(false);
    setStep("form");
    setGeneratedOffer(null);
    setPreviewHtml("");
    setValues({});
    setSelectedTemplateId("");
    setRecipientName("");
    setRecipientEmail("");
  }

  async function handleDownload(source?: {
    html?: string;
    id?: string;
    filename?: string;
    recipientName?: string | null;
    templateName?: string | null;
    supplementalCss?: string;
  }) {
    setDownloading(true);
    try {
      const offerId = source?.id ?? generatedOffer?.id;
      const filename =
        source?.filename ??
        buildDocumentPdfFilename(
          source?.recipientName ??
            detailOffer?.recipientName ??
            generatedOffer?.recipientName ??
            recipientName,
          source?.templateName ??
            detailOffer?.template?.name ??
            generatedOffer?.template?.name ??
            selectedTemplate?.name,
        );

      if (offerId) {
        await downloadOfferLetterPdf(offerId, filename);
        toast.success("PDF downloaded");
        return;
      }

      const html = source?.html ?? previewHtml;
      if (!html) {
        toast.error("No rendered content available for download");
        return;
      }

      await downloadPreviewHtmlAsPdf(html, filename, {
        recipientName:
          source?.recipientName ??
          generatedOffer?.recipientName ??
          recipientName ??
          null,
        templateName:
          source?.templateName ??
          generatedOffer?.template?.name ??
          selectedTemplate?.name ??
          null,
      });
      toast.success("PDF downloaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDownloading(false);
    }
  }

  async function openDetail(offer: OfferLetter) {
    try {
      const res = await httpClient.get<ApiResponse<OfferLetter>>(
        endpoints.offerLetterDetail(offer.id),
      );
      setDetailOffer(res.data.data ?? offer);
    } catch {
      setDetailOffer(offer);
    }
  }

  const columns: ColumnDef<OfferLetter>[] = [
    {
      id: "recipient",
      header: "Recipient",
      cell: ({ row }) => (
        <button
          type="button"
          className="text-left"
          onClick={() => void openDetail(row.original)}
        >
          <span className="font-medium text-foreground text-sm">
            {row.original.recipientName ?? "—"}
          </span>
          <p className="text-xs text-muted-foreground">
            {row.original.recipientEmail ?? ""}
          </p>
        </button>
      ),
    },
    {
      id: "template",
      header: "Template",
      cell: ({ row }) => (
        <div className="text-sm">
          <p className="font-medium text-foreground">
            {row.original.template?.name ?? "—"}
          </p>
          {row.original.templateVersion ? (
            <p className="text-xs text-muted-foreground">
              v{row.original.templateVersion.version}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={offerStatusBadgeVariant(row.original.status)}>
          {OFFER_STATUS_LABELS[row.original.status] ?? row.original.status}
        </Badge>
      ),
    },
    {
      id: "created",
      header: "Created",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            title="Clone & regenerate"
            onClick={() => openGenerate(row.original)}
          >
            <RefreshCw className="size-3.5" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            title="View details"
            onClick={() => void openDetail(row.original)}
          >
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
    <>
      <SectionCard
        title="Documents"
        description="Click a row to view details, download PDFs, update status, or delete documents."
      >
        <DataTable
          data={offerLetters}
          columns={columns as ColumnDef<Record<string, unknown>>[]}
          isLoading={listQuery.isLoading}
          emptyTitle="No documents yet"
          emptyDescription="Generated documents will appear here."
          page={page}
          totalPages={totalPages}
          total={listQuery.data?.meta.total ?? offerLetters.length}
          onPageChange={setPage}
        />
      </SectionCard>

      <Dialog
        open={generateOpen}
        onOpenChange={(open) =>
          !generateMutation.isPending &&
          !downloading &&
          (open ? setGenerateOpen(true) : closeGenerate())
        }
      >
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-hidden flex flex-col p-0">
          <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
            <div>
              <DialogTitle className="text-base">
                {step === "form" ? "Generate document" : "Preview document"}
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {step === "form"
                  ? "Enter recipient details, select a template, and fill mandatory variables before generating."
                  : "Review the generated document and download as PDF."}
              </DialogDescription>
            </div>
            {step === "preview" ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStep("form")}
                >
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  size="sm"
                  onClick={() =>
                    void handleDownload({
                      ...(generatedOffer?.id ? { id: generatedOffer.id } : {}),
                      html: previewHtml,
                      recipientName:
                        generatedOffer?.recipientName ?? recipientName ?? null,
                      templateName:
                        generatedOffer?.template?.name ??
                        selectedTemplate?.name ??
                        null,
                      supplementalCss: selectedTemplate?.cssContent ?? "",
                    })
                  }
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download PDF
                </Button>
              </div>
            ) : null}
          </div>

          {step === "form" ? (
            <div className="flex flex-1 overflow-hidden min-h-0">
              <div className="absolute left-6 top-16 z-10 flex gap-1 rounded-lg border border-border bg-slate-950/80 p-1 md:hidden">
                {(["variables", "preview"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setMobileTab(tab)}
                    className={`rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors ${mobileTab === tab ? "bg-white/10 text-foreground" : "text-muted-foreground"}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div
                className={`flex w-full shrink-0 flex-col gap-4 overflow-y-auto border-r border-border p-6 md:w-96 lg:w-[420px] ${mobileTab === "preview" ? "hidden md:flex" : "flex"}`}
              >
                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    Recipient name *
                  </span>
                  <Input
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                  />
                </label>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    Recipient email *
                  </span>
                  <Input
                    type="email"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    placeholder="e.g. rahul@example.com"
                  />
                </label>

                <label className="grid gap-1.5 text-sm">
                  <span className="font-medium text-foreground">
                    Template *
                  </span>
                  <select
                    className="h-10 rounded-lg border border-input bg-slate-950/55 px-3 text-sm text-foreground"
                    value={selectedTemplateId}
                    onChange={(event) =>
                      setSelectedTemplateId(event.target.value)
                    }
                  >
                    <option value="">Select template…</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                        {template.isDefault ? " (default)" : ""}
                        {template.currentVersion
                          ? ` v${template.currentVersion}`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                {(() => {
                  const formulas = selectedTemplate?.formulas ?? {};
                  const computedNames = getComputedVariableNames(formulas);

                  const inputVars =
                    selectedTemplate?.variables.filter(
                      (v) => !computedNames.has(v),
                    ) ?? [];

                  const computedVars =
                    selectedTemplate?.variables.filter((v) =>
                      computedNames.has(v),
                    ) ?? [];

                  const computedValues =
                    Object.keys(formulas).length > 0
                      ? applyFormulas(values, formulas)
                      : values;

                  // Helper function to format the display date contextually
                  const formatDateDisplay = (
                    dateString: string | undefined,
                  ) => {
                    if (!dateString) return "Pick a date";
                    const alreadyFormatted =
                      /^\d{1,2}\s[A-Za-z]+\,\s\d{4}$/.test(dateString);
                    if (alreadyFormatted) return dateString;

                    try {
                      return format(parseISO(dateString), "d MMMM, yyyy");
                    } catch (e) {
                      return dateString || "Invalid date";
                    }
                  };

                  return (
                    <>
                      {inputVars.map((variable) => {
                        const isDateField = variable
                          ?.toLowerCase()
                          .includes("_date");
                        const isPeriodField = variable
                          ?.toLowerCase()
                          .includes("period");

                        const formattedLabel = variable
                          ? variable
                              .replaceAll("_", " ")
                              .replace(/^\w/, (c) => c.toUpperCase())
                          : "";

                        // --- Period Calculation Parsing Logic ---
                        const currentValue = values[variable]
                          ? String(values[variable]).trim()
                          : "";

                        // Regular expression captures digits and text separately
                        const match = currentValue.match(
                          /^(\d+)?\s*([a-zA-Z]+)?$/,
                        );
                        const currentNum = match && match[1] ? match[1] : "";
                        const rawUnit =
                          match && match[2] ? match[2].toLowerCase() : "";

                        // Standardize the singular/plural base strings safely
                        const baseUnit = rawUnit.startsWith("day")
                          ? "days"
                          : rawUnit.startsWith("week")
                            ? "weeks"
                            : rawUnit.startsWith("month")
                              ? "months"
                              : rawUnit.startsWith("year")
                                ? "years"
                                : "";

                        const handlePeriodChange = (
                          newNum: string,
                          newUnit: string,
                        ) => {
                          // Fallback to "days" if user types a number before choosing a unit
                          const finalUnit = newUnit || baseUnit || "days";

                          // Dynamic singular/plural string suffix cleanups based on numeric input
                          const numericValue = parseInt(newNum, 10);
                          const cleanedUnit =
                            numericValue === 1
                              ? finalUnit.replace(/s$/, "")
                              : finalUnit.endsWith("s")
                                ? finalUnit
                                : `${finalUnit}s`;

                          // Formats the pure clean string expected by your backend state schema
                          const finalizedStringValue = newNum
                            ? `${newNum} ${cleanedUnit}`.trim()
                            : "";

                          setValues((prev) => ({
                            ...prev,
                            [variable]: finalizedStringValue,
                          }));
                        };
                        // ----------------------------------------

                        // Reusable select layout classes matching standard shadcn/ui Input
                        const selectClass =
                          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%2E%3E%3C%2Fsvg%3E')] bg-[length:14px] bg-[right_12px_center] bg-no-repeat text-foreground pr-8";

                        const inputClass =
                          "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground";

                        return (
                          <label key={variable} className="grid gap-1 text-sm">
                            <span className="font-mono text-[11px] text-cyan-300">
                              {formattedLabel}
                            </span>

                            {isDateField ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant={"outline"}
                                    className={cn(
                                      "w-full justify-start text-left font-normal bg-transparent border-input",
                                      !values[variable] &&
                                        "text-muted-foreground",
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span>
                                      {formatDateDisplay(values[variable])}
                                    </span>
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent
                                  className="w-auto p-0"
                                  align="start"
                                >
                                  <Calendar
                                    mode="single"
                                    selected={
                                      values[variable]
                                        ? /^\d{1,2}\s[A-Za-z]+\,\s\d{4}$/.test(
                                            String(values[variable]),
                                          )
                                          ? new Date(String(values[variable]))
                                          : parseISO(String(values[variable]))
                                        : undefined
                                    }
                                    onSelect={(date) =>
                                      setValues((prev) => ({
                                        ...prev,
                                        [variable]: date
                                          ? format(date, "d MMMM, yyyy")
                                          : "",
                                      }))
                                    }
                                    autoFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            ) : isPeriodField ? (
                              <div className="flex gap-2">
                                {/* Numeric Text Input */}
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  className={inputClass}
                                  placeholder="e.g. 90"
                                  value={currentNum}
                                  maxLength={3} // Locks keystrokes at a maximum of 3 characters
                                  onChange={(e) => {
                                    // Instantly cleans away letters, decimals, spaces, and signs
                                    const cleanVal = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    handlePeriodChange(cleanVal, baseUnit);
                                  }}
                                />

                                {/* Period Metric Dropdown Select Selector */}
                                <select
                                  className={selectClass}
                                  value={baseUnit}
                                  onChange={(e) =>
                                    handlePeriodChange(
                                      currentNum,
                                      e.target.value,
                                    )
                                  }
                                >
                                  <option
                                    value=""
                                    disabled
                                    className="bg-neutral-900 text-white"
                                  >
                                    Select Unit
                                  </option>
                                  <option
                                    value="days"
                                    className="bg-neutral-900 text-white"
                                  >
                                    Days
                                  </option>
                                  <option
                                    value="weeks"
                                    className="bg-neutral-900 text-white"
                                  >
                                    Weeks
                                  </option>
                                  <option
                                    value="months"
                                    className="bg-neutral-900 text-white"
                                  >
                                    Months
                                  </option>
                                  <option
                                    value="years"
                                    className="bg-neutral-900 text-white"
                                  >
                                    Years
                                  </option>
                                </select>
                              </div>
                            ) : (
                              <Input
                                value={values[variable] ?? ""}
                                onChange={(event) =>
                                  setValues((prev) => ({
                                    ...prev,
                                    [variable]: event.target.value,
                                  }))
                                }
                                placeholder={`Enter ${variable.replace(/_/g, " ")}…`}
                              />
                            )}
                          </label>
                        );
                      })}

                      {computedVars.length > 0 && (
                        <div className="rounded-xl border border-border bg-white/[0.02] p-3">
                          <p className="mb-2 text-[11px] text-muted-foreground">
                            Auto-computed from formulas
                          </p>
                          <div className="grid gap-2">
                            {computedVars.map((variable) => (
                              <div
                                key={variable}
                                className="flex items-center gap-2"
                              >
                                <span className="w-36 shrink-0 rounded bg-cyan-500/10 px-1.5 py-1 font-mono text-[11px] text-cyan-300">
                                  {`{{${variable}}}`}
                                </span>
                                <Input
                                  value={computedValues[variable] ?? "—"}
                                  readOnly
                                  disabled
                                  className="text-xs text-muted-foreground bg-transparent"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
                <div className="mt-auto pt-2">
                  <Button
                    className="w-full"
                    onClick={() => generateMutation.mutate()}
                    disabled={
                      generateMutation.isPending ||
                      !selectedTemplateId ||
                      !recipientName.trim() ||
                      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail) ||
                      !allFilled
                    }
                  >
                    {generateMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" /> Generating…
                      </>
                    ) : (
                      "Generate document"
                    )}
                  </Button>
                </div>
              </div>

              <div
                className={`flex flex-1 flex-col overflow-hidden p-4 ${mobileTab === "variables" ? "hidden md:flex" : "flex"}`}
              >
                <p className="mb-2 shrink-0 text-xs text-muted-foreground">
                  Live preview
                </p>
                {selectedTemplate ? (
                  <div
                    className="relative flex-1 overflow-auto rounded-xl border border-border bg-white mx-auto"
                    style={{ width: A4_WIDTH_PX, maxWidth: "100%" }}
                  >
                    <PageBreakOverlay pageCount={5} />
                    <iframe
                      srcDoc={previewHtml}
                      className="h-full w-full"
                      style={{
                        border: "none",
                        minHeight: A4_HEIGHT_PX,
                        width: A4_WIDTH_PX,
                      }}
                      title="Document preview"
                      sandbox="allow-same-origin allow-scripts" // Updated here
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
              <div
                className="relative flex-1 overflow-auto rounded-xl border border-border bg-white mx-auto"
                style={{ width: A4_WIDTH_PX, maxWidth: "100%" }}
              >
                <PageBreakOverlay pageCount={5} />
                <iframe
                  srcDoc={previewHtml}
                  className="h-full w-full"
                  style={{
                    border: "none",
                    minHeight: A4_HEIGHT_PX,
                    width: A4_WIDTH_PX,
                  }}
                  title="Generated document"
                  sandbox="allow-same-origin allow-scripts" // Updated here
                />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={detailOffer !== null}
        onOpenChange={(open) => !open && setDetailOffer(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Document details</DialogTitle>
            <DialogDescription>
              Review document metadata, preview content, and manage status.
            </DialogDescription>
          </DialogHeader>
          {detailOffer ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="text-sm font-medium">
                    {detailOffer.recipientName ?? "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {detailOffer.recipientEmail ?? ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Template</p>
                  <p className="text-sm font-medium">
                    {detailOffer.template?.name ?? "—"}
                    {detailOffer.templateVersion
                      ? ` (v${detailOffer.templateVersion.version})`
                      : ""}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={offerStatusBadgeVariant(detailOffer.status)}>
                    {OFFER_STATUS_LABELS[detailOffer.status] ??
                      detailOffer.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {new Date(detailOffer.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Generated</p>
                  <p className="text-sm">
                    {detailOffer.generatedAt
                      ? new Date(detailOffer.generatedAt).toLocaleString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void handleDownload({
                      id: detailOffer.id,
                      recipientName: detailOffer.recipientName ?? null,
                      templateName: detailOffer.template?.name ?? null,
                    })
                  }
                  disabled={downloading}
                >
                  {downloading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Download className="size-4" />
                  )}
                  Download PDF
                </Button>
                {["SENT", "ACCEPTED", "REJECTED", "CANCELLED"].map((status) => (
                  <Button
                    key={status}
                    variant="outline"
                    size="sm"
                    disabled={
                      statusMutation.isPending || detailOffer.status === status
                    }
                    onClick={() =>
                      statusMutation.mutate({ id: detailOffer.id, status })
                    }
                  >
                    Mark {OFFER_STATUS_LABELS[status]}
                  </Button>
                ))}
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setDeleteTarget(detailOffer)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmModal
        open={deleteTarget !== null}
        title="Delete document?"
        description="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}

/** @deprecated Use DocumentsTab via MailersAndDocsPage */
export const OfferLettersPage = DocumentsTab;
