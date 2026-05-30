import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useLead } from "@/lib/leadContext";

const HERO_IMAGES = ["/hero/1.webp", "/hero/2.webp"];
const ROTATE_MS = 10000;

export default function Hero() {
  const { openLead } = useLead();
  const ref = useRef(null);
  const [idx, setIdx] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0.3]);
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % HERO_IMAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(t);
  }, []);

  return (
    <section
      id="top"
      ref={ref}
      data-testid="hero-section"
      className="relative w-full min-h-screen overflow-hidden bg-[#050505]"
    >
      <motion.div style={{ scale, opacity }} className="absolute inset-0 z-0">
        {/* Preload both images, crossfade between them */}
        <AnimatePresence mode="sync">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0"
          >
            <img
              src={HERO_IMAGES[idx]}
              alt="BMW премиум защита полиуретановой плёнкой"
              loading="eager"
              fetchpriority="high"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </AnimatePresence>
        {/* Preload the next image invisibly */}
        <img
          src={HERO_IMAGES[(idx + 1) % HERO_IMAGES.length]}
          alt=""
          aria-hidden
          className="absolute opacity-0 pointer-events-none w-1 h-1"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/55 to-[#050505]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505]/80 via-[#050505]/30 to-transparent" />
      </motion.div>

      <motion.div style={{ y }} className="relative z-10 min-h-screen flex flex-col">
        <div className="flex-1 max-w-[1400px] w-full mx-auto px-6 md:px-10 pt-[140px] md:pt-[180px] pb-24 md:pb-28 flex flex-col justify-end">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            className="max-w-4xl"
          >
            <div className="eyebrow mb-6 text-white/70" data-testid="hero-overline">
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

            {/* Slide indicators */}
            <div className="flex items-center gap-2 mt-10">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  data-testid={`hero-slide-${i}`}
                  aria-label={`Слайд ${i + 1}`}
                  className={`h-[2px] transition-all duration-700 ${
                    idx === i ? "w-12 bg-white" : "w-6 bg-white/30 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
