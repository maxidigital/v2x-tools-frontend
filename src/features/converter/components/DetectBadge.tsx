import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { detectFormat, hexByteLength } from '@/lib/formatDetect';

/** Live auto-detect + byte-count indicator for the input payload. */
export function DetectBadge({ payload }: { payload: string }) {
  const { detected, bytes } = useMemo(
    () => ({ detected: detectFormat(payload), bytes: hexByteLength(payload) }),
    [payload]
  );

  if (!payload.trim()) return null;

  return (
    <div className="flex items-center gap-2 text-xs">
      {detected ? (
        <Badge variant="success">Detected: {detected}</Badge>
      ) : (
        <Badge variant="warning">Format not detected</Badge>
      )}
      {bytes !== null && <span className="text-muted-foreground">{bytes} bytes</span>}
    </div>
  );
}
