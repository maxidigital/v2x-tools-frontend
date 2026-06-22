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
  { ref: 'cam_v2', label: 'CAM v2' },
  { ref: 'denm_v2_23', label: 'DENM v2' },
  { ref: 'cpm_v2_23', label: 'CPM v2' },
  { ref: 'mapem_v2', label: 'MAPEM v2' },
  { ref: 'spatem_v2', label: 'SPATEM v2' },
  { ref: 'srem_v2', label: 'SREM v2' },
  { ref: 'ssem_v2', label: 'SSEM v2' },
  { ref: 'ivim_v2', label: 'IVIM v2' },
];

export interface ConvertRequest {
  payload: string;
  from: Format;
  to: Format;
  /** Optional message/type ref; omitted → hub auto-detects from the ITS header. */
  ref?: string;
}

export interface GenerateRequest {
  ref: string;
  format: Format;
  size: GenerateSize;
  minimal: boolean;
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
}
