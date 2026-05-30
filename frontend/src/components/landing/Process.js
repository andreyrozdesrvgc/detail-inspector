import { motion } from "framer-motion";
import { PROCESS_STEPS } from "@/lib/data";

export default function Process() {
  return (
    <section
      id="process"
      data-testid="process-section"
      className="bg-[#0d0d0d] py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-16 md:mb-24"
        >
          <div className="eyebrow mb-6">Процесс работы</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em] mb-6">
            Инженерный протокол из 6 этапов:<br />
            <span className="text-[#9a9a9a]">от аудита под светом до калибровки радаров</span>
          </h2>
          <p className="text-[#9a9a9a] text-base md:text-lg max-w-2xl leading-relaxed">
            Каждый этап выполняется узким специалистом. Исключаем риск порезов лака, сломанных клипс и ошибок электроники.
          </p>
        </motion.div>

        <div className="relative">
          {/* vertical line */}
          <div className="absolute left-[18px] md:left-1/2 top-0 bottom-0 w-px bg-white/10" aria-hidden />

          <div className="space-y-16 md:space-y-24">
            {PROCESS_STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0.2, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.55 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`relative pl-12 md:pl-0 md:grid md:grid-cols-2 md:gap-16 items-start ${
                  i % 2 ? "md:[&>*:first-child]:order-2" : ""
                }`}
                data-testid={`process-step-${i}`}
              >
                <div className={`md:px-10 ${i % 2 ? "md:text-left" : "md:text-right"}`}>
                  <div className="absolute left-0 md:left-1/2 md:-translate-x-1/2 top-0 size-9 border border-white/40 bg-[#050505] flex items-center justify-center font-mono text-[11px]">
                    {s.n}
                  </div>
                  <div className="eyebrow mb-4">Этап</div>
                  <h3 className="font-display text-2xl md:text-3xl leading-tight">{s.title}</h3>
                </div>
                <div className={`mt-4 md:mt-0 md:px-10 ${i % 2 ? "md:text-right" : "md:text-left"}`}>
                  <p className="text-[#9a9a9a] text-sm md:text-base leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
