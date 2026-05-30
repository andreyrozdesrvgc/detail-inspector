import { useRef } from "react";
import { motion } from "framer-motion";
import { useLead } from "@/lib/leadContext";
import { Play } from "lucide-react";

const REELS = [
  { id: 1, label: "Рассчитать проект защиты BMW", img: "https://images.unsplash.com/photo-1563826773-1e2b4b2cde42?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 2, label: "Получить персональную смету", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 3, label: "Узнать стоимость оклейки", img: "https://images.pexels.com/photos/36021355/pexels-photo-36021355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
  { id: 4, label: "Оценить стоимость вашего BMW", img: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 5, label: "Рассчитать защиту кузова", img: "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 6, label: "Получить консультацию мастера", img: "https://images.pexels.com/photos/10126657/pexels-photo-10126657.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
  { id: 7, label: "Узнать цену для вашего авто", img: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 8, label: "Заказать расчёт проекта", img: "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 9, label: "Получить индивидуальное предложение", img: "https://images.pexels.com/photos/6872174/pexels-photo-6872174.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
  { id: 10, label: "Рассчитать стоимость за 15 минут", img: "https://images.pexels.com/photos/20051458/pexels-photo-20051458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
];

export default function ReelsGallery() {
  const { openLead } = useLead();
  const scrollerRef = useRef(null);

  return (
    <section
      data-testid="reels-section"
      className="bg-[#050505] py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl"
        >
          <div className="eyebrow mb-5">Reels-кейсы · BMW</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em] mb-5">
            Реальные проекты по защите <span className="gold-text">BMW</span><br /><span className="text-[#9a9a9a]">в формате видео</span>
          </h2>
          <p className="text-[#9a9a9a] text-base md:text-lg max-w-2xl leading-relaxed">
            Посмотрите, как мы работаем с автомобилями премиум-класса.
          </p>
        </motion.div>
      </div>

      <div
        ref={scrollerRef}
        className="no-scrollbar overflow-x-auto"
      >
        <div className="flex gap-5 pl-6 md:pl-10 pr-6 md:pr-10 pb-8 snap-x snap-mandatory">
          {REELS.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: (i % 4) * 0.06 }}
              className="shrink-0 w-[260px] md:w-[300px] snap-center"
              data-testid={`reel-${r.id}`}
            >
              <div className="relative aspect-[9/16] overflow-hidden bg-[#151515] rounded-[20px] border border-white/10 group">
                <img
                  src={r.img}
                  alt={`Reel ${r.id}`}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="absolute top-4 left-4 size-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
                  <Play className="size-4 text-white fill-white" />
                </div>
                <div className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-[0.18em] text-white/85">
                  REEL · {String(r.id).padStart(2, "0")}
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="eyebrow text-white mb-2">BMW · Москва</div>
                </div>
              </div>
              <button
                onClick={() => openLead({ source: `reel-${r.id}`, note: r.label })}
                data-testid={`reel-cta-${r.id}`}
                className="btn-ghost w-full mt-4 py-3 uppercase tracking-[0.16em] text-[10px] font-medium"
              >
                <span>{r.label}</span>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
