/**
 * Wordless mark: a rounded shield outline with a single diagonal cut —
 * the "break" in "build & break". Uses currentColor so it follows the theme.
 */
export function Logo({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" className={className} aria-hidden>
      <path
        d="M16 3.5 26.5 7.6v8.1c0 6.4-4.4 11-10.5 12.8C9.9 26.7 5.5 22.1 5.5 15.7V7.6L16 3.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M20.5 10.5 11.5 21.5" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="11.5" cy="21.5" r="1.6" fill="var(--accent)" />
    </svg>
  );
}
