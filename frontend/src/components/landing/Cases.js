import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useLead } from "@/lib/leadContext";
import { CASES } from "@/lib/data";
import { X } from "lucide-react";

export default function Cases() {
  const [openIdx, setOpenIdx] = useState(null);
  const { openLead } = useLead();
  const active = openIdx !== null ? CASES[openIdx] : null;

  return (
    <section
      id="cases"
      data-testid="cases-section"
      className="bg-[#050505] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-16"
        >
          <div className="overline mb-5">Кейсы · BMW</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em]">
            Реальные работы<br /><span className="text-[#9a9a9a]">«до и после»</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-white/5 border border-white/10">
          {CASES.map((c, i) => (
            <motion.button
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (i % 3) * 0.06 }}
              onClick={() => setOpenIdx(i)}
              data-testid={`case-card-${i}`}
              className="bg-[#0d0d0d] text-left group lift"
            >
              <div className="aspect-[4/3] overflow-hidden bg-[#151515]">
                <img
                  src={c.img}
                  alt={c.model}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-baseline justify-between mb-3">
                  <div className="overline">{c.duration}</div>
                  <div className="font-mono text-xs text-white/60">{c.carPrice}</div>
                </div>
                <h3 className="font-display text-xl md:text-2xl mb-3 leading-tight">{c.model}</h3>
                <p className="text-sm text-[#9a9a9a] leading-relaxed mb-5">{c.work}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <span className="text-white text-sm font-medium">{c.price}</span>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/70 group-hover:text-white">
                    Открыть →
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white max-w-4xl p-0 rounded-sm overflow-hidden">
          <button
            onClick={() => setOpenIdx(null)}
            className="absolute right-4 top-4 z-20 text-white/80 hover:text-white"
            aria-label="Закрыть"
            data-testid="case-modal-close"
          >
            <X className="size-5" />
          </button>
          {active && (
            <AnimatePresence mode="wait">
              <motion.div
                key={active.model}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-2"
                data-testid="case-modal"
              >
                <div className="aspect-square md:aspect-auto overflow-hidden bg-[#151515]">
                  <img src={active.img} alt={active.model} className="w-full h-full object-cover" />
                </div>
                <div className="p-8 md:p-10">
                  <div className="overline mb-3">{active.duration}</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-4 leading-tight">{active.model}</h3>
                  <p className="text-sm text-[#9a9a9a] leading-relaxed mb-6">{active.work}</p>
                  <dl className="border-t border-white/10 pt-6 space-y-3 text-sm mb-8">
                    <div className="flex justify-between">
                      <dt className="text-[#9a9a9a]">Стоимость автомобиля</dt>
                      <dd className="text-white font-mono">{active.carPrice}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#9a9a9a]">Срок выполнения</dt>
                      <dd className="text-white">{active.duration}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-[#9a9a9a]">Стоимость проекта</dt>
                      <dd className="text-white font-medium">{active.price}</dd>
                    </div>
                  </dl>
                  <button
                    onClick={() => { setOpenIdx(null); openLead({ source: `case-${active.model}`, prefill: { bmw_model: active.model } }); }}
                    data-testid="case-modal-cta"
                    className="btn-primary w-full py-4 uppercase tracking-[0.18em] text-[11px] font-medium"
                  >
                    <span>Получить расчёт под мой BMW</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
