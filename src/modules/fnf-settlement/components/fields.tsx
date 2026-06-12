import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const formatCurrency = (val: unknown) => {
  const n = Number(val ?? 0);
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);
}

const FieldError = ({ error }: { error: string | undefined }) => {
  if (!error) return null;
  return <p className="mt-1 text-xs text-rose-400">{error}</p>;
};

export const Field = ({ label, value, error }: { label: string; value: unknown; error?: string | undefined }) => {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <p className="mt-1 text-sm">{String(value ?? "-")}</p>
      <FieldError error={error} />
    </div>
  );
}

export const SelectField = ({ label, value, onChange, options, error }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  error?: string | undefined;
}) => {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Select value={value || ""} onValueChange={onChange}>
        <SelectTrigger className={`mt-1 ${error ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}>
          <SelectValue placeholder={`Select ${label}`} />
        </SelectTrigger>
        <SelectContent>
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldError error={error} />
    </div>
  );
}

export const SwitchField = ({ label, checked, onChange }: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-white/[0.03] px-4 py-3">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export const InputField = ({ label, value, onChange, type = "text", error }: {
  label: string;
  value: unknown;
  onChange: (v: string) => void;
  type: string;
  error: string | undefined;
}) => {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={(value ?? "") as string}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1 ${error ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
      />
      <FieldError error={error} />
    </div>
  );
}

export const NumericField = ({ label, value, onChange, error }: {
  label: string;
  value: unknown;
  onChange: (v: number) => void;
  error: string | undefined;
}) => {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={(value ?? "") as number}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className={`mt-1 ${error ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
      />
      <FieldError error={error} />
    </div>
  );
}

export const CurrencyField = ({ label, value, onChange, error }: {
  label: string;
  value: unknown;
  onChange: (v: number) => void;
  error?: string | undefined;
}) => {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">₹</span>
        <Input
          type="number"
          value={(value ?? "") as number}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className={`pl-7 ${error ? "border-rose-500 focus-visible:ring-rose-500" : ""}`}
        />
      </div>
      <FieldError error={error} />
    </div>
  );
}

export type SectionTabProps = {
  value: Record<string, unknown>;
  onChange: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
  errors?: Record<string, string> | undefined;
};
