/**
 * Animated "aurora" backdrop for the login page — the asn1click brand aesthetic (deep automotive night
 * with drifting brand-colored blobs, a faint grid, and a vignette). Ported from v2x-connect-now.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'var(--night)' }} />

      <div
        className="absolute -top-48 -left-40 h-[60vw] w-[60vw] rounded-full blur-[110px]"
        style={{ background: 'var(--brand-1)', opacity: 0.55, animation: 'aurora1 22s ease-in-out infinite' }}
      />
      <div
        className="absolute top-1/4 -right-32 h-[55vw] w-[55vw] rounded-full blur-[110px]"
        style={{ background: 'var(--brand-2)', opacity: 0.5, animation: 'aurora2 28s ease-in-out infinite' }}
      />
      <div
        className="absolute -bottom-48 left-1/4 h-[60vw] w-[60vw] rounded-full blur-[130px]"
        style={{ background: 'var(--brand-3)', opacity: 0.5, animation: 'aurora3 32s ease-in-out infinite' }}
      />
      <div
        className="absolute top-1/2 left-1/2 h-[45vw] w-[45vw] rounded-full blur-[130px]"
        style={{ background: 'var(--brand-4)', opacity: 0.35, animation: 'aurora4 36s ease-in-out infinite' }}
      />

      {/* Faint grid */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
        }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
