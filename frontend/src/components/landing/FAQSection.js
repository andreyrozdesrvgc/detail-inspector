import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_ITEMS, BRAND } from "@/lib/data";
import { PhoneCall } from "lucide-react";

export default function FAQSection() {
  return (
    <section
      data-testid="faq-section"
      className="bg-[#0d0d0d] py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="eyebrow mb-6">FAQ</div>
          <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02] tracking-[-0.03em]">
            Частые вопросы<br /><span className="text-white">по оклейке BMW</span>
          </h2>

          {/* CTA block below heading */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="mt-10 border border-white/10 bg-[#050505] p-7"
          >
            <div className="flex items-center gap-3 mb-3">
              <PhoneCall className="size-5 text-[var(--gold-3)] shrink-0" strokeWidth={1.6} />
              <div className="text-[11px] uppercase tracking-[0.22em] gold-text font-semibold">Не нашли ответ?</div>
            </div>
            <p className="text-sm text-[#9a9a9a] leading-relaxed mb-5">
              Задайте вопрос мастеру напрямую — отвечаем по технологиям, материалам и срокам без скриптов.
            </p>
            <a
              href={`tel:${BRAND.phoneRaw}`}
              data-testid="faq-cta-btn"
              className="btn-gold w-full sm:w-auto inline-block px-7 py-3.5 uppercase tracking-[0.2em] text-[11px] font-semibold rounded-sm text-center"
            >
              <span>Заказать звонок</span>
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Accordion type="single" collapsible className="w-full" data-testid="faq-accordion">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="border-white/10"
              >
                <AccordionTrigger
                  className="text-left text-base md:text-lg font-display font-medium hover:no-underline py-6 [&[data-state=open]]:text-white text-white/90 tracking-tight"
                  data-testid={`faq-trigger-${i}`}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-mono text-[#9a9a9a] text-xs shrink-0">0{i + 1 < 10 ? i + 1 : i + 1}</span>
                    {item.q}
                  </span>
                </AccordionTrigger>
                <AccordionContent
                  className="text-[#9a9a9a] text-sm md:text-base leading-relaxed pl-10"
                  data-testid={`faq-content-${i}`}
                >
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  );
}
