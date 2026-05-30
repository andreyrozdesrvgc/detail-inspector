import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useLead } from "@/lib/leadContext";

const HERO_IMG =
  "https://images.unsplash.com/photo-1563826773-1e2b4b2cde42?w=2400&q=85&auto=format&fit=crop";

export default function Hero() {
  const { openLead } = useLead();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="relative w-full min-h-screen overflow-hidden bg-[#050505]"
    >
      <motion.div style={{ scale, opacity }} className="absolute inset-0 z-0">
        <img
          src={HERO_IMG}
          alt="BMW премиум защита полиуретановой плёнкой"
          loading="eager"
          fetchpriority="high"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/60 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent" />
      </motion.div>

      <motion.div style={{ y }} className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-10 pt-[140px] md:pt-[180px] pb-24 md:pb-28 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="max-w-4xl"
          >
            <div className="overline mb-6 text-white/70" data-testid="hero-overline">
              SEO Landing · BMW · Москва
            </div>

            <h1
              data-testid="hero-h1"
              className="font-display text-[34px] sm:text-[42px] md:text-[56px] lg:text-[68px] leading-[1.02] tracking-[-0.035em] mb-6"
            >
              Новый BMW за <span className="gold-text">12 млн</span>?
              <br />
              <span className="text-[#9a9a9a]">Защитите ЛКП</span> от сколов
              <br />
              на 10+ лет
            </h1>

            <p
              data-testid="hero-sub"
              className="text-white/70 text-base md:text-lg max-w-2xl leading-relaxed mb-10"
            >
              Не конкурируем с оклейкой за 250 тыс. Используем плёнки премиум-класса
              и выполняем работы мастерами с опытом 20+ лет.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => openLead({ source: "hero-primary" })}
                data-testid="hero-cta-primary"
                className="btn-primary px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium"
              >
                <span>Получить расчёт под мою BMW</span>
              </button>
              <a
                href="#triggers"
                data-testid="hero-cta-secondary"
                className="btn-ghost px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium inline-flex items-center"
              >
                <span>Подробнее</span>
              </a>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
