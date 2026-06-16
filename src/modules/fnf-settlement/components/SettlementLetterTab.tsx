import { Loader2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type SettlementLetterTabProps = {
  letterHtml: string | null;
  downloading: boolean;
  onDownloadPdf: () => void;
};

const SettlementLetterTab = ({ letterHtml, downloading, onDownloadPdf }: SettlementLetterTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Settlement Letter</h3>
        <Button variant="outline" size="sm" onClick={onDownloadPdf} disabled={downloading}>
          {downloading ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-1.5 h-4 w-4" />
          )}
          Download PDF
        </Button>
      </div>
      {letterHtml ? (
        <div
          className="rounded-lg border border-border bg-white p-8 text-black"
          dangerouslySetInnerHTML={{ __html: letterHtml }}
        />
      ) : (
        <div className="rounded-lg border border-border bg-white/[0.03] p-8">
          <p className="text-center text-muted-foreground">
            Save the settlement data to generate the settlement letter preview.
          </p>
        </div>
      )}
    </div>
  );
}

export default SettlementLetterTab;