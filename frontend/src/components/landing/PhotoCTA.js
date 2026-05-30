import { motion } from "framer-motion";
import { useLead } from "@/lib/leadContext";
import { Send } from "lucide-react";

export default function PhotoCTA() {
  const { openLead } = useLead();
  return (
    <section
      data-testid="photo-cta-section"
      className="bg-[#0d0d0d] py-24 md:py-32 border-t border-white/5 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-30">
        <img
          src="https://images.pexels.com/photos/36021355/pexels-photo-36021355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1600"
          alt="Процесс PPF"
          loading="lazy"
          className="w-full h-full object-cover grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0d0d0d] via-[#0d0d0d]/70 to-[#0d0d0d]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-[1100px] mx-auto px-6 md:px-10 text-center"
      >
        <div className="overline mb-6">Быстрый расчёт</div>
        <h2 className="font-display text-[34px] md:text-[64px] leading-[1.0] tracking-[-0.04em] mb-8">
          Отправьте фото автомобиля<br />
          <span className="text-[#9a9a9a]">и получите расчёт за 15 минут</span>
        </h2>
        <p className="text-[#9a9a9a] text-base md:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Мастер изучит снимки кузова и подготовит предварительную смету до очного осмотра.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="https://t.me/detail_inspector"
            target="_blank"
            rel="noreferrer"
            data-testid="photo-cta-telegram"
            className="btn-primary px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium inline-flex items-center gap-2"
          >
            <span className="inline-flex items-center gap-2"><Send className="size-4" /> Отправить фото в Telegram</span>
          </a>
          <button
            onClick={() => openLead({ source: "photo-cta" })}
            data-testid="photo-cta-form"
            className="btn-ghost px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium"
          >
            <span>Заказать звонок</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
