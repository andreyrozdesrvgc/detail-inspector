/* Premium endless BMW logo marquee */
const BMWLogo = ({ className = "" }) => (
  <svg viewBox="0 0 100 100" className={className} aria-hidden>
    <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="3" />
    <circle cx="50" cy="50" r="36" fill="none" stroke="currentColor" strokeWidth="1.4" />
    <path d="M50 14 A36 36 0 0 1 86 50 L50 50 Z" fill="currentColor" opacity="0.0" />
    <path d="M50 14 A36 36 0 0 1 86 50 L50 50 Z" fill="currentColor" />
    <path d="M50 86 A36 36 0 0 1 14 50 L50 50 Z" fill="currentColor" />
    <text x="50" y="11" textAnchor="middle" fontSize="9" fill="currentColor" fontFamily="Inter, sans-serif" fontWeight="700">BMW</text>
  </svg>
);

const LOGOS = Array.from({ length: 12 });

export default function BMWMarquee() {
  return (
    <section
      data-testid="bmw-marquee"
      className="bg-[#050505] py-2 md:py-3 overflow-hidden"
      aria-label="BMW специализация"
    >
      <div className="marquee-mask relative h-[90px] md:h-[120px] flex items-center">
        <div className="marquee-track items-center gap-[80px] pr-[80px]">
          {[...LOGOS, ...LOGOS].map((_, i) => (
            <div
              key={i}
              className="text-white/80 hover:text-white transition-opacity duration-500"
              style={{ opacity: 0.8 }}
            >
              <BMWLogo className="size-[56px] md:size-[72px]" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
