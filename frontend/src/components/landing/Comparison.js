import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useLead } from "@/lib/leadContext";
import { COMPARISON } from "@/lib/data";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function Comparison() {
  const { openLead } = useLead();
  return (
    <section
      data-testid="comparison-section"
      className="bg-[#050505] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="max-w-4xl mb-16"
        >
          <div className="overline mb-5">Сравнение стандартов</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em] mb-6">
            Не рискуйте новым автомобилем:<br />
            <span className="text-[#9a9a9a]">выберите доказуемый протокол безопасности</span>
          </h2>
          <p className="text-[#9a9a9a] text-base md:text-lg leading-relaxed max-w-2xl">
            Сравните, чем отличается «гаражная» оклейка от стандартов Detail Inspector.
          </p>
        </motion.div>

        {/* Desktop comparison */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="hidden md:block border border-white/10"
        >
          <div className="grid grid-cols-[1.4fr_1.5fr_1.5fr]">
            <div className="bg-[#050505] p-6 border-b border-r border-white/10">
              <div className="overline text-[#9a9a9a]">Параметр</div>
            </div>
            <div className="bg-[#0d0d0d] p-6 border-b border-r border-white/10 relative">
              <div className="absolute -top-3 left-6 bg-white text-black px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium">
                Detail Inspector
              </div>
              <div className="overline text-white">Премиум-протокол</div>
            </div>
            <div className="bg-[#050505] p-6 border-b border-white/10">
              <div className="overline text-[#9a9a9a]">Гаражный детейлинг</div>
            </div>

            {COMPARISON.map((row, i) => (
              <div key={i} className="contents">
                <div className="bg-[#050505] p-6 border-b border-r border-white/10 text-sm text-white/80">
                  {row.row}
                </div>
                <div className="bg-[#0d0d0d] p-6 border-b border-r border-white/10 text-sm text-white flex items-start gap-3">
                  <Check className="size-4 mt-0.5 shrink-0 text-white" />
                  <span>{row.us}</span>
                </div>
                <div className="bg-[#050505] p-6 border-b border-white/10 text-sm text-[#9a9a9a] flex items-start gap-3">
                  <X className="size-4 mt-0.5 shrink-0 text-[#9a9a9a]" />
                  <span>{row.them}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Mobile */}
        <div className="md:hidden space-y-4">
          {COMPARISON.map((row, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              variants={fadeUp}
              className="border border-white/10 p-5 bg-[#0d0d0d]"
            >
              <div className="overline mb-3">{row.row}</div>
              <div className="flex items-start gap-2 mb-3">
                <Check className="size-4 mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1">Detail Inspector</div>
                  <div className="text-sm text-white">{row.us}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <X className="size-4 mt-0.5 shrink-0 text-[#9a9a9a]" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-white/40 mb-1">Гаражный детейлинг</div>
                  <div className="text-sm text-[#9a9a9a]">{row.them}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12">
          <button
            onClick={() => openLead({ source: "comparison" })}
            data-testid="comparison-cta"
            className="btn-primary px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium"
          >
            <span>Рассчитать стоимость онлайн</span>
          </button>
        </div>
      </div>
    </section>
  );
}
