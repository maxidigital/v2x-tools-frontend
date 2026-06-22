import { useState } from 'react';
import { toast } from 'sonner';
import { convert, HubError } from '@/services/hubClient';
import { analytics } from '@/services/analytics';
import { useConverterStore } from '@/stores/useConverterStore';

/** Runs a conversion: validates, applies the same-format short-circuit, then
 *  calls the hub and pushes the result into a new output tab. */
export function useConvert() {
  const [isLoading, setLoading] = useState(false);

  const run = async () => {
    const { payload, inputFormat, outputFormat, ref, addTab } = useConverterStore.getState();
    const trimmed = payload.trim();

    if (!trimmed) {
      toast.warning('Paste a payload first');
      return;
    }

    // Same-format: no backend round-trip, just echo into a tab (legacy behavior).
    if (inputFormat === outputFormat) {
      addTab({ format: outputFormat, content: payload, originalInput: payload });
      return;
    }

    setLoading(true);
    try {
      const result = await convert({
        payload,
        from: inputFormat,
        to: outputFormat,
        ref: ref.trim() || undefined,
      });
      addTab({ format: outputFormat, content: result, originalInput: payload });
      analytics.conversionSuccess(inputFormat, outputFormat);
    } catch (err) {
      const message = err instanceof HubError ? err.message : 'Conversion failed';
      toast.error(message);
      analytics.conversionFailed(inputFormat, outputFormat);
      analytics.conversionError(message);
    } finally {
      setLoading(false);
    }
  };

  return { run, isLoading };
}
