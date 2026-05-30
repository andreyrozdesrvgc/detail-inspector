import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLead } from "@/lib/leadContext";
import { CASES } from "@/lib/data";
import { ZoomIn } from "lucide-react";

export default function Cases() {
  const [openIdx, setOpenIdx] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const { openLead } = useLead();
  const active = openIdx !== null ? CASES[openIdx] : null;

  useEffect(() => { setActiveImg(0); setLightbox(false); }, [openIdx]);

  return (
    <section
      id="cases"
      data-testid="cases-section"
      className="bg-[#050505] py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-16"
        >
          <div className="eyebrow mb-6">Кейсы · BMW</div>
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
                  <div className="eyebrow">{c.duration}</div>
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
        <DialogContent className="bg-[#0a0a0a] border border-white/10 text-white max-w-5xl p-0 rounded-sm overflow-hidden max-h-[92vh] overflow-y-auto">
          <DialogTitle className="sr-only">{active ? active.model : "Кейс"}</DialogTitle>
          <DialogDescription className="sr-only">Галерея и детали кейса оклейки BMW.</DialogDescription>
          {active && (
            <AnimatePresence mode="wait">
              <motion.div
                key={active.model}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr]"
                data-testid="case-modal"
              >
                {/* Gallery */}
                <div className="bg-[#050505]">
                  <button
                    onClick={() => setLightbox(true)}
                    className="block w-full relative group"
                    data-testid="case-modal-zoom"
                    aria-label="Увеличить"
                  >
                    <div className="aspect-[16/11] overflow-hidden bg-[#151515]">
                      <img src={active.gallery[activeImg]} alt={`${active.model} ${activeImg + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.02]" />
                    </div>
                    <div className="absolute top-4 right-4 size-10 bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ZoomIn className="size-4" />
                    </div>
                    <div className="absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.2em] text-white/80 font-mono">
                      {String(activeImg + 1).padStart(2, "0")} / {String(active.gallery.length).padStart(2, "0")}
                    </div>
                  </button>
                  <div className="grid grid-cols-5 gap-px bg-white/5">
                    {active.gallery.map((g, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImg(i)}
                        data-testid={`case-thumb-${i}`}
                        className={`aspect-[4/3] overflow-hidden bg-[#0d0d0d] transition-opacity ${
                          activeImg === i ? "opacity-100 ring-1 ring-white" : "opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img src={g} alt={`thumb ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Details */}
                <div className="p-8 md:p-10">
                  <div className="eyebrow mb-4">{active.duration}</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-4 leading-tight">{active.model}</h3>
                  <p className="text-sm text-[#9a9a9a] leading-relaxed mb-6">{active.work}</p>
                  <dl className="border-t border-white/10 pt-6 space-y-3 text-sm mb-8">
                    <div className="flex justify-between gap-3"><dt className="text-[#9a9a9a]">Стоимость авто</dt><dd className="text-white font-mono">{active.carPrice}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[#9a9a9a]">Срок</dt><dd className="text-white">{active.duration}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-[#9a9a9a]">Стоимость проекта</dt><dd className="text-white font-medium">{active.price}</dd></div>
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

      {/* Fullscreen lightbox */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent className="bg-[#050505] border-0 text-white max-w-[96vw] w-[96vw] p-0 rounded-sm overflow-hidden">
          <DialogTitle className="sr-only">{active ? active.model : "Фото"}</DialogTitle>
          <DialogDescription className="sr-only">Полноразмерный просмотр фотографии кейса.</DialogDescription>
          {active && (
            <div className="w-full max-h-[92vh] flex items-center justify-center">
              <img src={active.gallery[activeImg]} alt={active.model} className="max-w-full max-h-[92vh] object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
