import { BRAND } from "@/lib/data";

export default function Footer() {
  return (
    <footer
      id="contacts"
      data-testid="footer-section"
      className="bg-[#050505] border-t border-white/10 pt-16 md:pt-24 pb-10"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1.4fr] gap-12">
        <div>
        <div className="flex items-center gap-3 mb-6">
            <img src="/logo.png" alt="Detail Inspector" className="h-12 w-auto" />
          </div>
          <p className="text-sm text-[#9a9a9a] leading-relaxed max-w-sm mb-6">
            Премиальная оклейка BMW полиуретановой плёнкой. Защита ЛКП, сохранение стоимости автомобиля на 10+ лет.
          </p>
          <div className="text-xs text-[#9a9a9a]/70 leading-relaxed">
            © 2025 Detail Inspector. Все права защищены.
          </div>
        </div>

        <div>
          <div className="eyebrow mb-6">Контакты</div>
          <ul className="space-y-3 text-sm">
            <li><a href={`tel:${BRAND.phoneRaw}`} data-testid="footer-phone" className="text-white hover:text-white/70 transition-colors font-mono">{BRAND.phone}</a></li>
            <li className="text-[#9a9a9a]">{BRAND.address}</li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-6">Документы</div>
          <ul className="space-y-3 text-sm">
            <li><a href="#" className="text-white/85 hover:text-white transition-colors">Политика конфиденциальности</a></li>
            <li><a href="#" className="text-white/85 hover:text-white transition-colors">Договор оферты</a></li>
            <li><a href="#" className="text-white/85 hover:text-white transition-colors">Реквизиты</a></li>
          </ul>
        </div>

        <div>
          <div className="eyebrow mb-6">Студия в Москве</div>
          <div className="aspect-[4/3] bg-[#0d0d0d] border border-white/10 overflow-hidden relative" data-testid="footer-map">
            {/* Stylized dark map placeholder */}
            <svg viewBox="0 0 400 300" className="w-full h-full">
              <rect width="400" height="300" fill="#0a0a0a" />
              <g stroke="#1f1f1f" strokeWidth="0.5" fill="none">
                {Array.from({ length: 20 }).map((_, i) => (
                  <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="300" />
                ))}
                {Array.from({ length: 16 }).map((_, i) => (
                  <line key={`h${i}`} x1="0" y1={i * 20} x2="400" y2={i * 20} />
                ))}
              </g>
              <path d="M0 180 Q 100 160, 200 175 T 400 170" stroke="#2a2a2a" strokeWidth="2" fill="none" />
              <path d="M50 0 L120 80 L200 100 L260 200 L300 300" stroke="#2a2a2a" strokeWidth="1.4" fill="none" />
              <path d="M0 100 L160 130 L240 90 L400 130" stroke="#2a2a2a" strokeWidth="1.4" fill="none" />
              <circle cx="210" cy="155" r="6" fill="#ffffff" />
              <circle cx="210" cy="155" r="14" fill="#ffffff" opacity="0.15" />
              <circle cx="210" cy="155" r="24" fill="#ffffff" opacity="0.06" />
            </svg>
            <div className="absolute bottom-3 left-3 text-[10px] uppercase tracking-[0.2em] text-white/70 font-mono">Москва · Кузнецкий мост</div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mt-12 pt-6 border-t border-white/5 flex flex-wrap items-center justify-between gap-4">
        <div className="text-[11px] uppercase tracking-[0.22em] text-[#9a9a9a]">ИНЖЕНЕРНЫЙ ПРОТОКОЛ · BMW · 2025</div>
        <div className="text-[11px] text-[#9a9a9a] font-mono">v 1.0 · Production</div>
      </div>
    </footer>
  );
}
