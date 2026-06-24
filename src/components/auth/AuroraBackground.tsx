/**
 * Animated "aurora" backdrop — ported verbatim from v2x-connect-now (asn1click). Deep green night with
 * drifting brand blobs, a faint grid, and a vignette. Used only by the /login brand page.
 */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-night" />
      {/* Animated aurora blobs */}
      <div className="absolute -top-40 -left-40 h-[55vw] w-[55vw] rounded-full bg-brand-1/40 blur-[120px] animate-aurora-1" />
      <div className="absolute top-1/3 -right-32 h-[50vw] w-[50vw] rounded-full bg-brand-2/35 blur-[120px] animate-aurora-2" />
      <div className="absolute -bottom-40 left-1/4 h-[55vw] w-[55vw] rounded-full bg-brand-3/40 blur-[140px] animate-aurora-3" />
      <div className="absolute top-1/2 left-1/2 h-[40vw] w-[40vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-4/25 blur-[140px] animate-aurora-4" />
      {/* Grid overlay */}
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
      {/* Noise / vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />
    </div>
  );
}
