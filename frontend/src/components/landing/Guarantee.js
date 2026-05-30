import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, ZoomIn, Maximize2, FileText, ShieldCheck, ClipboardList } from "lucide-react";
import { DOCS } from "@/lib/data";
import { useLead } from "@/lib/leadContext";

const DocPreview = ({ doc, index, total, angle, large = false, onClick }) => (
  <motion.div
    onClick={onClick}
    whileHover={{ y: -8, rotate: angle * 0.7 }}
    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    style={{ rotate: angle }}
    className={`paper cursor-pointer relative ${large ? "w-[260px] h-[360px] md:w-[280px] md:h-[395px]" : "w-[240px] h-[330px]"}`}
    data-testid={`doc-preview-${index}`}
  >
    <div className="p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-mono">Detail Inspector</div>
        <div className="text-[10px] font-mono text-black/40">№ {String(index + 1).padStart(4, "0")}/25</div>
      </div>
      <div className="h-px bg-black/15 mb-4" />
      <div className="text-[11px] uppercase tracking-[0.18em] text-black/50 mb-1.5">Документ</div>
      <h4 className="text-base md:text-lg font-semibold text-black leading-tight mb-3 font-display">{doc.title}</h4>
      <div className="h-px bg-black/10 mb-3" />
      <ul className="space-y-1.5 text-[10px] text-black/70">
        {doc.fields.slice(0, 4).map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="size-1 bg-black/40 rounded-full mt-1.5 shrink-0" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-3 border-t border-black/10 text-[9px] text-black/40 font-mono">
        Стр. 1 из 3 · BMW VIN · Москва
      </div>
    </div>
  </motion.div>
);

const ICONS = [ClipboardList, FileText, ShieldCheck];

export default function Guarantee() {
  const [open, setOpen] = useState(null);
  const { openLead } = useLead();

  const openLeadFromGuarantee = () => openLead({ source: "guarantee" });

  const next = () => setOpen((i) => (i + 1) % DOCS.length);
  const prev = () => setOpen((i) => (i - 1 + DOCS.length) % DOCS.length);

  return (
    <section
      data-testid="guarantee-section"
      className="bg-[#050505] py-24 md:py-32 relative overflow-hidden"
    >
      <div className="absolute inset-0 grain" />
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-start">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mb-12"
            >
              <div className="overline mb-5">Документальная гарантия</div>
              <h2 className="font-display text-[32px] md:text-[52px] leading-[1.02] tracking-[-0.03em] mb-6">
                Каждый автомобиль <span className="gold-text">сопровождается</span><br />
                <span className="text-[#9a9a9a]">официальным пакетом документов</span>
              </h2>
              <p className="text-[#9a9a9a] text-base md:text-lg leading-relaxed">
                Мы фиксируем состояние автомобиля, объём работ и гарантийные обязательства документально. Вы точно знаете, что передаёте нам и что получите после завершения работ.
              </p>
            </motion.div>

            <div className="space-y-3">
              {DOCS.map((d, i) => {
                const Icon = ICONS[i];
                return (
                  <motion.button
                    key={d.title}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                    onClick={() => setOpen(i)}
                    data-testid={`doc-card-${i}`}
                    className="w-full text-left group border border-white/10 bg-[#0d0d0d] p-6 md:p-7 hover:border-white/30 transition-all flex items-start gap-5"
                  >
                    <div className="size-10 border border-white/20 flex items-center justify-center shrink-0">
                      <Icon className="size-4 text-white" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                      <div className="overline mb-1.5">Карточка {i + 1}</div>
                      <h3 className="font-display text-lg md:text-xl mb-2 leading-tight">{d.title}</h3>
                      <p className="text-sm text-[#9a9a9a] leading-relaxed">{d.desc}</p>
                    </div>
                    <div className="text-xs uppercase tracking-[0.18em] text-white/40 group-hover:text-white transition-colors shrink-0 hidden md:block">
                      Открыть →
                    </div>
                  </motion.button>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 border border-white/10 p-6 md:p-7 bg-[#0d0d0d]"
            >
              <p className="text-sm text-white/85 leading-relaxed mb-5">
                Ваш автомобиль защищён не только плёнкой, но и официальными обязательствами компании. Это особенно важно для владельцев новых и дорогостоящих автомобилей.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#9a9a9a]">
                {[
                  "Фиксация состояния автомобиля",
                  "Полная прозрачность работ",
                  "Официальная гарантия",
                  "Документальное сопровождение проекта",
                ].map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <span className="text-white">✓</span> {t}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Fan spread of documents + CTA */}
          <div className="hidden lg:flex flex-col items-center justify-center relative">
            <div className="relative h-[450px] flex items-center justify-center w-full">
              {DOCS.map((d, i) => {
                const angle = (i - 1) * 8;
                const offsetX = (i - 1) * 50;
                return (
                  <div
                    key={d.title}
                    style={{ transform: `translateX(${offsetX}px)`, zIndex: i }}
                    className="absolute"
                  >
                    <DocPreview doc={d} index={i} total={DOCS.length} angle={angle} large onClick={() => setOpen(i)} />
                  </div>
                );
              })}
            </div>

            {/* CTA centered under fan, level with last left card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-10 flex flex-col items-center text-center"
            >
              <div className="text-[11px] uppercase tracking-[0.22em] text-[#9a9a9a] mb-4">
                Сметы прозрачны до рубля
              </div>
              <button
                onClick={openLeadFromGuarantee}
                data-testid="guarantee-cta"
                className="btn-gold px-10 py-4 uppercase tracking-[0.2em] text-[11px] font-semibold rounded-sm"
              >
                <span>Рассчитать стоимость</span>
              </button>
            </motion.div>
          </div>

          {/* Mobile swipe row */}
          <div className="lg:hidden no-scrollbar overflow-x-auto -mx-6 px-6">
            <div className="flex gap-4 pb-4">
              {DOCS.map((d, i) => (
                <div key={d.title} className="shrink-0">
                  <DocPreview doc={d} index={i} total={DOCS.length} angle={0} onClick={() => setOpen(i)} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA below documents — centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 md:mt-24 flex flex-col items-center text-center"
        >
          <div className="text-[11px] uppercase tracking-[0.22em] text-[#9a9a9a] mb-5">
            Все документы — ваши. Сметы прозрачны до рубля
          </div>
          <button
            onClick={() => openLeadFromGuarantee()}
            data-testid="guarantee-cta"
            className="btn-gold px-10 py-4 uppercase tracking-[0.2em] text-[11px] font-semibold rounded-sm"
          >
            <span>Рассчитать стоимость</span>
          </button>
          <p className="mt-4 text-xs text-[#9a9a9a]/80 max-w-md">
            Бесплатный осмотр и документальный аудит ЛКП с фиксацией состояния
          </p>
        </motion.div>
      </div>

      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="bg-[#050505] border border-white/10 text-white max-w-4xl p-0 rounded-sm overflow-hidden">
          <DialogTitle className="sr-only">{open !== null ? DOCS[open].title : "Документ"}</DialogTitle>
          <DialogDescription className="sr-only">Образец официального документа Detail Inspector.</DialogDescription>
          <AnimatePresence mode="wait">
            {open !== null && (
              <motion.div
                key={open}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr]"
                data-testid="doc-modal"
              >
                <div className="bg-[#0d0d0d] p-8 md:p-10 flex items-center justify-center min-h-[400px]">
                  <div className="paper w-full max-w-[360px] aspect-[1/1.41] p-7 flex flex-col">
                    <div className="flex justify-between mb-5">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-black/50 font-mono">Detail Inspector · BMW</div>
                      <div className="text-[10px] font-mono text-black/40">№ {String(open + 1).padStart(4, "0")}/25</div>
                    </div>
                    <div className="h-px bg-black/15 mb-5" />
                    <div className="text-[10px] uppercase tracking-[0.18em] text-black/50 mb-1">Документ</div>
                    <h4 className="font-display text-xl md:text-2xl text-black leading-tight mb-5">{DOCS[open].title}</h4>
                    <div className="h-px bg-black/10 mb-4" />
                    <ul className="space-y-2 text-xs text-black/75 flex-1">
                      {DOCS[open].fields.map((f, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-black/40 font-mono">0{i + 1}</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto pt-4 border-t border-black/10 flex items-end justify-between text-[9px] text-black/40 font-mono">
                      <span>Стр. 1 из 3 · BMW VIN</span>
                      <span>__________</span>
                    </div>
                  </div>
                </div>
                <div className="p-8 md:p-10 relative">
                  <div className="overline mb-4">Документ {open + 1} из {DOCS.length}</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-5 leading-tight">{DOCS[open].title}</h3>
                  <p className="text-sm text-[#9a9a9a] leading-relaxed mb-6">{DOCS[open].desc}</p>
                  <div className="border-t border-white/10 pt-5 space-y-2 mb-8">
                    {DOCS[open].fields.map((f, i) => (
                      <div key={i} className="text-sm text-white/80 flex gap-3">
                        <span className="font-mono text-[#9a9a9a]">0{i + 1}</span>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-white/10 pt-5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prev}
                        data-testid="doc-modal-prev"
                        className="size-10 border border-white/15 hover:border-white/40 transition-colors flex items-center justify-center"
                        aria-label="Предыдущий документ"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <button
                        onClick={next}
                        data-testid="doc-modal-next"
                        className="size-10 border border-white/15 hover:border-white/40 transition-colors flex items-center justify-center"
                        aria-label="Следующий документ"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#9a9a9a]">
                      <ZoomIn className="size-4" />
                      <Maximize2 className="size-4" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
}
