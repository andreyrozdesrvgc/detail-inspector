import { motion } from "framer-motion";
import { CONTROL_CARDS } from "@/lib/data";
import { Camera, Video, UserRound, Eye } from "lucide-react";

const ICONS = [Camera, Video, UserRound, Eye];

export default function Control() {
  return (
    <section
      data-testid="control-section"
      className="bg-[#050505] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mb-16"
        >
          <div className="overline mb-5">Контроль работ</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em]">
            Следите за работой<br /><span className="text-[#9a9a9a]">над автомобилем онлайн</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border border-white/10">
          {CONTROL_CARDS.map((c, i) => {
            const Icon = ICONS[i];
            return (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 }}
                className="bg-[#0d0d0d] p-8 md:p-10 lift"
                data-testid={`control-card-${i}`}
              >
                <Icon className="size-7 text-white mb-8" strokeWidth={1.5} />
                <h3 className="font-display text-xl md:text-2xl mb-3 leading-tight">{c.t}</h3>
                <p className="text-sm text-[#9a9a9a] leading-relaxed">{c.d}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
