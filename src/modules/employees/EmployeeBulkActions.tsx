import { Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { employeeBulkApi } from '@/services/api/employee-bulk.api';
import { getErrorMessage } from '@/lib/errors';

type Props = {
  onCompleted?: () => void;
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function EmployeeBulkActions({ onCompleted }: Props) {
  const [importOpen, setImportOpen] = useState(false);
  const [validRows, setValidRows] = useState<unknown[]>([]);
  const [invalidRows, setInvalidRows] = useState<Array<{ row: number; errors: string[] }>>([]);

  const templateMutation = useMutation({
    mutationFn: () => employeeBulkApi.downloadTemplate(),
    onSuccess: (blob) => {
      downloadBlob(blob, 'employee-import-template.xlsx');
      toast.success('Template downloaded');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const exportMutation = useMutation({
    mutationFn: () => employeeBulkApi.exportEmployees(),
    onSuccess: (blob) => {
      downloadBlob(blob, 'employees-export.xlsx');
      toast.success('Export downloaded');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const validateMutation = useMutation({
    mutationFn: (file: File) => employeeBulkApi.validateImport(file),
    onSuccess: (data) => {
      setValidRows(data?.validRows ?? []);
      setInvalidRows(data?.invalidRows ?? []);
      toast.success(`Validated: ${data?.summary.valid ?? 0} valid, ${data?.summary.invalid ?? 0} invalid`);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const confirmMutation = useMutation({
    mutationFn: () => employeeBulkApi.confirmImport(validRows),
    onSuccess: (data) => {
      toast.success(`Imported ${data?.createdCount ?? 0} employees`);
      if (data?.failures?.length) {
        toast.message(`${data.failures.length} rows failed`);
      }
      setImportOpen(false);
      setValidRows([]);
      setInvalidRows([]);
      onCompleted?.();
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled={templateMutation.isPending} onClick={() => templateMutation.mutate()}>
          {templateMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileSpreadsheet className="mr-2 h-4 w-4" />}
          Template
        </Button>
        <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Import
        </Button>
        <Button variant="outline" size="sm" disabled={exportMutation.isPending} onClick={() => exportMutation.mutate()}>
          {exportMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Export
        </Button>
      </div>

      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bulk import employees</DialogTitle>
            <DialogDescription>Upload the template XLSX. Valid rows can be imported partially if some rows fail validation.</DialogDescription>
          </DialogHeader>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) validateMutation.mutate(file);
            }}
          />
          {invalidRows.length > 0 ? (
            <div className="max-h-40 overflow-y-auto rounded-md border p-3 text-xs text-destructive">
              {invalidRows.map((row) => (
                <p key={row.row}>Row {row.row}: {row.errors.join('; ')}</p>
              ))}
            </div>
          ) : null}
          <Button disabled={validRows.length === 0 || confirmMutation.isPending} onClick={() => confirmMutation.mutate()}>
            Import {validRows.length} valid rows
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
