import { useState } from 'react';
import { toast } from 'sonner';
import { convert, HubError } from '@/services/hubClient';
import { analytics, type ConversionMeta } from '@/services/analytics';
import { hexByteLength } from '@/lib/formatDetect';
import { convertOp, stripComments, withOrigin } from '@/lib/comments';
import { useConverterStore } from '@/stores/useConverterStore';
import { askAi } from '@/features/chat/useChatStore';

/** Runs a conversion: validates, applies the same-format short-circuit, then
 *  calls the hub and pushes the result into a new output tab. */
export function useConvert() {
  const [isLoading, setLoading] = useState(false);

  const run = async () => {
    const { payload: typed, inputFormat, outputFormat, ref, compat, addTab } = useConverterStore.getState();
    // `#` lines are the user's comments: they stay on the tab's Input, the hub gets the payload alone
    const payload = stripComments(typed);
    const trimmed = payload.trim();

    if (!trimmed) {
      toast.warning('Paste a payload first');
      return;
    }

    // Same-format: no backend round-trip, just echo into a tab (legacy behavior).
    if (inputFormat === outputFormat) {
      addTab({ format: outputFormat, content: payload, originalInput: typed });
      return;
    }

    const meta: ConversionMeta = {
      from: inputFormat,
      to: outputFormat,
      auto: !ref.trim(),
      bytes: hexByteLength(payload),
      compat,
    };
    setLoading(true);
    try {
      const result = await convert({
        payload,
        from: inputFormat,
        to: outputFormat,
        ref: ref.trim() || undefined,
        compat,
      });
      const origin = { op: convertOp(inputFormat, outputFormat), ref: ref.trim() || undefined, from: inputFormat, to: outputFormat, compat };
      addTab({ format: outputFormat, content: result.text, originalInput: withOrigin(origin, typed), info: result.info });
      analytics.conversionSuccess({ ...meta, message: result.info.resolvedMessage });
    } catch (err) {
      const message = err instanceof HubError ? err.message : 'Conversion failed';
      toast.error(message, {
        duration: 15_000,
        action: {
          label: 'Ask AI why',
          onClick: () =>
            askAi(`Converting my input from ${inputFormat} to ${outputFormat} fails with: "${message}". Why, and how do I fix it?`, {
              send: true,
            }),
        },
      });
      analytics.conversionFailed(meta);
      analytics.conversionError(message);
    } finally {
      setLoading(false);
    }
  };

  return { run, isLoading };
}
