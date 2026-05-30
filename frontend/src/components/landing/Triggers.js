import { motion } from "framer-motion";
import { useLead } from "@/lib/leadContext";

const TRIGGERS = [
  {
    n: "8",
    unit: "лет опыта",
    title: "Безупречная репутация с 2018 года",
    desc: "Ни одного порезанного кузова и ноль судебных исков за всё время работы студии.",
  },
  {
    n: "01",
    unit: "Протокол",
    title: "Протокол безопасности",
    desc: "Рез плёнки без касания кузова. Сборка штатным арматурщиком с бесплатной заменой сломанных клипс.",
  },
  {
    n: "5.0",
    unit: "Яндекс · 2ГИС",
    title: "Идеальный рейтинг",
    desc: "Более 220 отзывов. Официальная гарантия 1 год на работу и до 10 лет на материал.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 },
  }),
};

export default function Triggers() {
  const { openLead } = useLead();
  return (
    <section
      id="triggers"
      data-testid="triggers-section"
      className="bg-[#050505] relative py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeUp}
          custom={0}
          className="mb-16 md:mb-24 max-w-3xl"
        >
          <div className="overline mb-5">Три причины выбрать нас</div>
          <h2 className="font-display text-[36px] md:text-[56px] leading-[1.0] tracking-[-0.03em]">
            Не «оклейка»,<br /> а <span className="gold-text">инженерный сервис</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 border border-white/10">
          {TRIGGERS.map((t, i) => (
            <motion.div
              key={t.title}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.4 }}
              variants={fadeUp}
              custom={i + 1}
              className="bg-[#0d0d0d] p-10 md:p-12 lift"
              data-testid={`trigger-card-${i}`}
            >
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-[64px] md:text-[80px] leading-none tracking-[-0.05em]">
                  {t.n}
                </span>
                <span className="overline">{t.unit}</span>
              </div>
              <h3 className="font-display text-xl md:text-2xl mb-4 leading-tight">{t.title}</h3>
              <p className="text-[#9a9a9a] text-sm leading-relaxed">{t.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={4}
          className="mt-12 flex flex-wrap gap-4"
        >
          <button
            onClick={() => openLead({ source: "triggers-primary" })}
            data-testid="triggers-cta-primary"
            className="btn-primary px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium"
          >
            <span>Рассчитать стоимость под мой BMW</span>
          </button>
          <button
            onClick={() => openLead({ source: "triggers-inspect", prefill: { note: "Бесплатный осмотр" } })}
            data-testid="triggers-cta-inspect"
            className="btn-ghost px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium"
          >
            <span>Записаться на бесплатный осмотр</span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
