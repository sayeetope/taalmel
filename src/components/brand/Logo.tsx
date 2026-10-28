/**
 * Taalमेल visual mark.
 *
 * Two offset coverage rings that overlap into a single shared lobe: the
 * moment interference becomes agreement. The dot at the shared centre is
 * the access point both rings are tuned around.
 */
export function LogoMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="8" stroke="currentColor" strokeOpacity="0.28" />
      <circle cx="12" cy="12.5" r="7.25" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="20" cy="19.5" r="7.25" stroke="currentColor" strokeWidth="1.6" strokeOpacity="0.55" />
      <circle cx="16" cy="16" r="2.6" fill="currentColor" />
      <path d="M5 27.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.55" />
      <path d="M21 27.5h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.55" />
    </svg>
  );
}

/**
 * Wordmark. Devanagari is set larger and nudged down so its shirorekha sits
 * level with the Latin cap height rather than above it, and a small gap keeps
 * the headline from touching the Latin terminal.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={30} className="shrink-0 text-accent" />
      <span className="flex items-baseline leading-none">
        <span className="font-display text-[22px] font-bold tracking-[0.01em] text-ink">Taal</span>
        <span className="ml-[2px] inline-block translate-y-[1px] font-display text-[26px] font-bold leading-none text-ink">
          मेल
        </span>
      </span>
      {!compact && (
        <span className="hidden text-[11px] leading-tight text-ink-3 sm:block">
          Campus Wi-Fi
          <br />
          channel planner
        </span>
      )}
    </span>
  );
}
