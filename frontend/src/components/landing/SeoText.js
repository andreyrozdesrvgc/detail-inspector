import { motion } from "framer-motion";
import { SEO_TEXT } from "@/lib/data";
import { useLead } from "@/lib/leadContext";

export default function SeoText() {
  const { openLead } = useLead();
  const paragraphs = SEO_TEXT.trim().split(/\n\n+/);
  return (
    <section
      data-testid="seo-text-section"
      className="bg-[#050505] py-24 md:py-32"
    >
      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="overline mb-6">Защита BMW в Москве</div>
          <h2 className="font-display text-[28px] md:text-[42px] leading-[1.05] tracking-[-0.03em]">
            Полиуретановая плёнка PPF для BMW: что нужно знать владельцу
          </h2>
        </motion.div>
        <div className="space-y-5 text-[#9a9a9a] text-[15px] md:text-base leading-[1.75]">
          {paragraphs.map((p, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.6, delay: i * 0.04, ease: "easeOut" }}
            >
              {p.trim()}
            </motion.p>
          ))}
        </div>

        {/* CTAs at the end of the article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mt-14 pt-10 border-t border-white/10"
        >
          <div className="overline mb-5">Готовы перейти к расчёту?</div>
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-7 max-w-2xl">
            Получите персональную смету по вашей модели BMW или закажите звонок мастера — без обязательств.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => openLead({ source: "seo-quote", note: "Запросить смету" })}
              data-testid="seo-cta-quote"
              className="btn-gold px-8 py-4 uppercase tracking-[0.2em] text-[11px] font-semibold rounded-sm"
            >
              <span>Запросить смету</span>
            </button>
            <button
              onClick={() => openLead({ source: "seo-callback", note: "Заказать звонок" })}
              data-testid="seo-cta-callback"
              className="btn-ghost px-8 py-4 uppercase tracking-[0.18em] text-[11px] font-medium"
            >
              <span>Заказать звонок</span>
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
