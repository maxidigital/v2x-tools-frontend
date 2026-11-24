import { useState } from 'react';
import { toast } from 'sonner';
import { generate, HubError } from '@/services/hubClient';
import { analytics } from '@/services/analytics';
import { useConverterStore } from '@/stores/useConverterStore';
import type { Format, GenerateContent } from '@/types';

interface GenerateOptions {
  ref: string;
  format: Format;
  content: GenerateContent;
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
      const payload = await generate({ ...opts, compat: useConverterStore.getState().compat });
      setPayload(payload);
      setInputFormat(opts.format);
      setRef(opts.ref);
      toast.success('Sample payload generated');
      analytics.generateSuccess(opts.ref, opts.format);
    } catch (err) {
      const message = err instanceof HubError ? err.message : 'Generation failed';
      toast.error(message);
      analytics.generateFailed(opts.ref, message);
    } finally {
      setLoading(false);
    }
  };

  return { run, isLoading };
}
