import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useConverterStore } from '@/stores/useConverterStore';
import { COMPAT_OPTIONS, type Compat } from '@/types';

/** Encoding rules: X.691 standard (default) or like asn1c-based stacks (Vanetza). Remembered per browser. */
export function CompatSelect() {
  const { compat, setCompat } = useConverterStore();
  const current = COMPAT_OPTIONS.find((o) => o.value === compat);
  return (
    <div className="flex items-center gap-2" title={current?.hint}>
      <span className="text-xs text-muted-foreground">rules</span>
      <Select value={compat} onValueChange={(v) => setCompat(v as Compat)}>
        <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Encoding rules">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COMPAT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value} className="text-xs" title={o.hint}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
