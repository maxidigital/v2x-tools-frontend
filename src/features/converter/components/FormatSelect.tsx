import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FORMATS, FORMAT_LABELS, type Format } from '@/types';
import { cn } from '@/lib/cn';

interface FormatSelectProps {
  value: Format;
  onChange: (f: Format) => void;
  label?: string;
  className?: string;
}

export function FormatSelect({ value, onChange, label, className }: FormatSelectProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
      <Select value={value} onValueChange={(v) => onChange(v as Format)}>
        <SelectTrigger className="h-8 w-[130px] text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {FORMATS.map((f) => (
            <SelectItem key={f} value={f} className="text-xs">
              {FORMAT_LABELS[f]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
