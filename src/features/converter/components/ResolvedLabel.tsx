import type { ResolvedInfo } from '@/types';

export interface ResultInfoProps {
  info?: ResolvedInfo;
}

/**
 * "Decoded as _denm_v2_3 (auto-detected) · asn1c rules": which definition the hub used. Matters after an
 * auto-detect, when several versions share one header identity (DENM 2.2 / 2.3.1, CAM v2 / 2.3.1).
 */
export function ResolvedLabel({ info }: ResultInfoProps) {
  if (!info || (!info.resolvedRef && !info.resolvedMessage)) return null;
  const what = info.resolvedMessage ?? info.resolvedRef;
  return (
    <span className="normal-case" title={info.resolvedRef}>
      · {info.autoDetected ? 'auto-detected as' : 'decoded as'}{' '}
      <span className="font-mono text-foreground">{what}</span>
      {info.resolvedMessage && info.resolvedRef && (
        <span className="font-mono"> ({info.resolvedRef})</span>
      )}
      {info.compat === 'asn1c' && <span> · asn1c / Vanetza rules</span>}
    </span>
  );
}
