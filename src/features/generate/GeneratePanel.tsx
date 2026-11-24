import { useState, type ReactNode } from 'react';
import { Loader2, Shuffle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormatSelect } from '@/features/converter/components/FormatSelect';
import { useGenerate } from './hooks/useGenerate';
import { useUiStore } from '@/stores/useUiStore';
import {
  GENERATE_CONTENTS,
  MESSAGE_TYPES,
  type Format,
  type GenerateContent,
} from '@/types';

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

export function GeneratePanel() {
  const [ref, setRef] = useState(MESSAGE_TYPES[0].ref);
  const [format, setFormat] = useState<Format>('UPER');
  const [content, setContent] = useState<GenerateContent>('RANDOM');
  const { run, isLoading } = useGenerate();
  const setInputMode = useUiStore((s) => s.setInputMode);

  const submit = async () => {
    await run({ ref, format, content });
    setInputMode('paste'); // reveal the generated payload in the editor
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-auto p-4">
      <div>
        <h2 className="text-sm font-semibold">Generate sample message</h2>
        <p className="text-xs text-muted-foreground">
          Build a random ETSI ITS payload, then convert it.
        </p>
      </div>

      <Field label="Message type">
        <Select value={ref} onValueChange={setRef}>
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MESSAGE_TYPES.map((m) => (
              <SelectItem key={m.ref} value={m.ref}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Output format">
        <FormatSelect value={format} onChange={setFormat} />
      </Field>

      <Field label="Content">
        <Select value={content} onValueChange={(v) => setContent(v as GenerateContent)}>
          <SelectTrigger className="text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {GENERATE_CONTENTS.map((c) => (
              <SelectItem key={c.value} value={c.value} title={c.hint}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-foreground">
          {GENERATE_CONTENTS.find((c) => c.value === content)?.hint}
        </span>
      </Field>

      <Button onClick={submit} disabled={isLoading} className="mt-1">
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shuffle className="h-4 w-4" />}
        Generate
      </Button>
    </div>
  );
}
