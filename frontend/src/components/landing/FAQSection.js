import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/data";

export default function FAQSection() {
  return (
    <section
      data-testid="faq-section"
      className="bg-[#0d0d0d] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-[1fr_1.6fr] gap-12 lg:gap-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="overline mb-5">FAQ</div>
          <h2 className="font-display text-[34px] md:text-[52px] leading-[1.02] tracking-[-0.03em]">
            Частые вопросы<br /><span className="text-[#9a9a9a]">по оклейке BMW</span>
          </h2>
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
