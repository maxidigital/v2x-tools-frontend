/** Wire encodings supported by the hub codec. */
export type Format = 'UPER' | 'WER' | 'XER' | 'JER';

export const FORMATS: Format[] = ['UPER', 'WER', 'XER', 'JER'];

/** Human labels (JER≈JSON / X.697, XER≈XML / X.693). */
export const FORMAT_LABELS: Record<Format, string> = {
  UPER: 'UPER',
  WER: 'WER',
  XER: 'XER (XML)',
  JER: 'JER (JSON)',
};

/** Generate sample sizes (hub `size` enum). */
export type GenerateSize = 'SMALLEST' | 'SMALL' | 'MEDIUM' | 'BIG' | 'BIGGEST';

export const GENERATE_SIZES: { value: GenerateSize; label: string }[] = [
  { value: 'SMALLEST', label: 'Smallest' },
  { value: 'SMALL', label: 'Small' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'BIG', label: 'Big' },
  { value: 'BIGGEST', label: 'Biggest' },
];

/** Built-in ETSI ITS message refs (X-Ref) preserved from the legacy app. */
export interface MessageType {
  ref: string;
  label: string;
}

export const MESSAGE_TYPES: MessageType[] = [
  { ref: '_cam_v2_3', label: 'CAM 2.3.1 (TS 103 900)' },
  { ref: '_cam_v2', label: 'CAM v2 (EN 302 637-2)' },
  { ref: '_denm_v2_3', label: 'DENM 2.3.1 (TS 103 831)' },
  { ref: '_denm_v2_23', label: 'DENM 2.2 (EN 302 637-3)' },
  { ref: '_cpm_v2_23', label: 'CPM 2.1.1 (TS 103 324)' },
  { ref: '_vam_v3_1', label: 'VAM 2.3.1 (TS 103 300-3)' },
  { ref: '_mapem_v2', label: 'MAPEM v2' },
  { ref: '_spatem_v2', label: 'SPATEM v2' },
  { ref: '_srem_v2', label: 'SREM v2' },
  { ref: '_ssem_v2', label: 'SSEM v2' },
  { ref: '_ivim_v2', label: 'IVIM v2 (IVI v2)' },
];

/**
 * Encoding rules. `standard` = X.691 as written (ObjSys, asn1tools). `asn1c` = like asn1c-based stacks
 * (Vanetza), which depart from X.691 in a few constraints (CPM container list, CAM extension containers,
 * PathPredicted…). Sent as the hub's X-Compat header.
 */
export type Compat = 'standard' | 'asn1c';

export const COMPAT_OPTIONS: { value: Compat; label: string; hint: string }[] = [
  { value: 'standard', label: 'X.691 standard', hint: 'As the standard says (ObjSys, asn1tools)' },
  { value: 'asn1c', label: 'asn1c / Vanetza', hint: 'Like asn1c-based stacks (Vanetza), which differ in a few constraints' },
];

/** Which definition the hub used (its X-Resolved-* / X-Auto-Detected / X-Compat response headers). */
export interface ResolvedInfo {
  resolvedRef?: string;
  resolvedMessage?: string;
  autoDetected: boolean;
  compat?: Compat;
}

/** GET /api/messages/versions: one row per V2X header identity ("protocolVersion:messageId"). */
export interface MessageVersionRow {
  identity: string;
  versions: { name: string; module: string; rootElement: string; description?: string; scope: string }[];
  publicDefault: string | null;
  userDefault: string | null;
  effective: string | null;
}

export interface ConvertRequest {
  payload: string;
  from: Format;
  to: Format;
  /** Optional message/type ref; omitted → hub auto-detects from the ITS header. */
  ref?: string;
  compat?: Compat;
}

export interface GenerateRequest {
  ref: string;
  format: Format;
  size: GenerateSize;
  minimal: boolean;
  compat?: Compat;
}

/** One output tab in the right panel. Mirrors the legacy TabManager model. */
export interface ResultTab {
  id: string;
  format: Format;
  content: string;
  originalInput: string;
  timestamp: string;
  number: number;
  customName?: string;
  /** Which definition decoded it (absent for same-format echoes). */
  info?: ResolvedInfo;
}
