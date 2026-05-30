import { motion } from "framer-motion";
import { SEO_TEXT } from "@/lib/data";

export default function SeoText() {
  const paragraphs = SEO_TEXT.trim().split(/\n\n+/);
  return (
    <section
      data-testid="seo-text-section"
      className="bg-[#050505] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[900px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <div className="overline mb-4">Защита BMW в Москве</div>
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
      </div>
    </section>
  );
}
