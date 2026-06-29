import { useState } from 'react';
import { toast } from 'sonner';
import { generate, HubError } from '@/services/hubClient';
import { useConverterStore } from '@/stores/useConverterStore';
import type { Format, GenerateSize } from '@/types';

interface GenerateOptions {
  ref: string;
  format: Format;
  size: GenerateSize;
  minimal: boolean;
}

/** Generates a sample payload and loads it into the input editor. */
export function useGenerate() {
  const [isLoading, setLoading] = useState(false);
  const setPayload = useConverterStore((s) => s.setPayload);
  const setInputFormat = useConverterStore((s) => s.setInputFormat);
  const setRef = useConverterStore((s) => s.setRef);

  const run = async (opts: GenerateOptions) => {
    setLoading(true);
    try {
      const payload = await generate(opts);
      setPayload(payload);
      setInputFormat(opts.format);
      setRef(opts.ref);
      toast.success('Sample payload generated');
    } catch (err) {
      toast.error(err instanceof HubError ? err.message : 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return { run, isLoading };
}
