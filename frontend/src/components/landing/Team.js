import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLead } from "@/lib/leadContext";
import { TEAM } from "@/lib/data";

export default function Team() {
  const [active, setActive] = useState(TEAM[0].id);
  const { openLead } = useLead();
  const member = TEAM.find((m) => m.id === active);

  return (
    <section
      data-testid="team-section"
      className="bg-[#050505] py-16 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-10 md:mb-16"
        >
          <div className="eyebrow mb-4 md:mb-5">Команда</div>
          <h2 className="font-display text-[26px] md:text-[56px] leading-[1.05] md:leading-[1.02] tracking-[-0.03em]">
            Ваши <span className="gold-text">BMW</span> в руках<br /><span className="text-white">лучших специалистов Москвы</span>
          </h2>
        </motion.div>

        {/* Switcher */}
        <div className="flex flex-wrap gap-1.5 md:gap-2 mb-6 md:mb-10">
          {TEAM.map((m) => (
            <button
              key={m.id}
              onClick={() => setActive(m.id)}
              data-testid={`team-tab-${m.id}`}
              className={`px-3 md:px-5 py-2 md:py-3 border text-[10px] md:text-xs uppercase tracking-[0.16em] transition-all ${
                active === m.id ? "bg-white text-black border-white" : "border-white/10 text-white hover:border-white/40"
              }`}
            >
              {m.name.split(" ")[0]}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={member.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.4fr] border border-white/10 bg-[#0d0d0d]"
            data-testid="team-card"
          >
            <div className="relative aspect-[5/4] md:aspect-[4/5] lg:aspect-auto overflow-hidden bg-[#151515]">
              <img
                src={member.img}
                alt={member.name}
                className="w-full h-full object-cover grayscale"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-transparent to-transparent" />
              <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                <div className="font-mono text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/70 mb-2">
                  0{TEAM.findIndex((m) => m.id === member.id) + 1} / 0{TEAM.length}
                </div>
              </div>
            </div>

            <div className="p-5 md:p-12 flex flex-col">
              <div className="eyebrow mb-3 md:mb-4">{member.role}</div>
              <h3 className="font-display text-xl md:text-4xl mb-4 md:mb-6 leading-tight">{member.name}</h3>

              <div className="border-t border-white/10 pt-4 md:pt-6 mb-5 md:mb-8">
                <div className="eyebrow mb-2 md:mb-3">Главная задача</div>
                <p className="text-white/85 text-sm md:text-base leading-relaxed">{member.task}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 mb-5 md:mb-8">
                {member.tags.map((tag, i) => (
                  <div key={i} className="gold-frame bg-[#0a0a0a] p-3 md:p-5">
                    <div className="font-display text-sm md:text-base text-white mb-1 md:mb-2 leading-tight">{tag.t}</div>
                    <div className="text-[11px] md:text-xs text-[#9a9a9a] leading-relaxed">{tag.d}</div>
                  </div>
                ))}
              </div>

              <div className="mt-auto">
                <button
                  onClick={() => openLead({ source: `team-${member.id}` })}
                  data-testid={`team-cta-${member.id}`}
                  className="btn-primary w-full md:w-auto px-7 py-3.5 uppercase tracking-[0.18em] text-[11px] font-medium"
                >
                  <span>Рассчитать стоимость онлайн</span>
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
