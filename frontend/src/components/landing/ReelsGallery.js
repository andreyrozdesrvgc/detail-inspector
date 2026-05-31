import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLead } from "@/lib/leadContext";
import { Play, X } from "lucide-react";

/*
 * Reels gallery.
 *
 * 🎬 КАК ДОБАВИТЬ ВИДЕО:
 *   1. Положите файлы в /app/frontend/public/reels/
 *      → 1.mp4, 2.mp4, 3.mp4, ... (mp4, H.264, ≤ 30 МБ)
 *   2. (Опционально) Положите превью-кадры: /app/frontend/public/reels/1.jpg ...
 *   3. Никаких изменений кода не нужно — каждая карточка ниже уже знает свой путь.
 *      Если видео нет — карточка покажет статичное превью из Unsplash и всё равно
 *      будет вести на форму заявки.
 */

const REELS = [
  { id: 1, label: "Рассчитать проект защиты BMW", video: "/reels/1.mp4", poster: "/reels/1.jpg", fallback: "https://images.unsplash.com/photo-1563826773-1e2b4b2cde42?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 2, label: "Получить персональную смету", video: "/reels/2.mp4", poster: "/reels/2.jpg", fallback: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 3, label: "Узнать стоимость оклейки", video: "/reels/3.mp4", poster: "/reels/3.jpg", fallback: "https://images.pexels.com/photos/36021355/pexels-photo-36021355.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
  { id: 4, label: "Оценить стоимость вашего BMW", video: "/reels/4.mp4", poster: "/reels/4.jpg", fallback: "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 5, label: "Рассчитать защиту кузова", video: "/reels/5.mp4", poster: "/reels/5.jpg", fallback: "https://images.unsplash.com/photo-1610647752706-3bb12232b3ab?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 6, label: "Получить консультацию мастера", video: "/reels/6.mp4", poster: "/reels/6.jpg", fallback: "https://images.pexels.com/photos/10126657/pexels-photo-10126657.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
  { id: 7, label: "Узнать цену для вашего авто", video: "/reels/7.mp4", poster: "/reels/7.jpg", fallback: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 8, label: "Заказать расчёт проекта", video: "/reels/8.mp4", poster: "/reels/8.jpg", fallback: "https://images.unsplash.com/photo-1607853554439-0069ec0f29b6?w=900&q=85&auto=format&fit=crop&h=1600" },
  { id: 9, label: "Получить индивидуальное предложение", video: "/reels/9.mp4", poster: "/reels/9.jpg", fallback: "https://images.pexels.com/photos/6872174/pexels-photo-6872174.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
  { id: 10, label: "Рассчитать стоимость за 15 минут", video: "/reels/10.mp4", poster: "/reels/10.jpg", fallback: "https://images.pexels.com/photos/20051458/pexels-photo-20051458.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1600&w=900" },
];

// Probe a media URL (HEAD) — true if reachable (status 2xx).
async function probeUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function ReelCard({ reel, onOpen, onLead }) {
  const [hasVideo, setHasVideo] = useState(false);
  const [poster, setPoster] = useState(reel.fallback);
  const videoRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await probeUrl(reel.video);
      if (!alive) return;
      setHasVideo(ok);
      if (ok) {
        const posterOk = await probeUrl(reel.poster);
        if (!alive) return;
        if (posterOk) setPoster(reel.poster);
      }
    })();
    return () => { alive = false; };
  }, [reel.video, reel.poster]);

  const handleHoverPlay = () => {
    if (hasVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };
  const handleHoverStop = () => {
    if (hasVideo && videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <div className="shrink-0 w-[260px] md:w-[300px] snap-center" data-testid={`reel-${reel.id}`}>
      <button
        onClick={() => (hasVideo ? onOpen(reel) : onLead(reel))}
        onMouseEnter={handleHoverPlay}
        onMouseLeave={handleHoverStop}
        className="relative aspect-[9/16] w-full overflow-hidden bg-[#151515] rounded-[20px] border border-white/10 group block"
        aria-label={hasVideo ? "Открыть видео" : reel.label}
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={reel.video}
            poster={poster}
            muted
            playsInline
            loop
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={reel.fallback}
            alt={`Reel ${reel.id}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-4 left-4 size-9 rounded-full bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center">
          <Play className="size-4 text-white fill-white" />
        </div>
        <div className="absolute top-4 right-4 text-[10px] font-mono uppercase tracking-[0.18em] text-white/85">
          REEL · {String(reel.id).padStart(2, "0")}
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="eyebrow text-white mb-2">BMW · Москва</div>
        </div>
        {!hasVideo && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 pointer-events-none">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-mono px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10">
              Видео скоро
            </div>
          </div>
        )}
      </button>
      <button
        onClick={() => onLead(reel)}
        data-testid={`reel-cta-${reel.id}`}
        className="btn-ghost w-full mt-4 py-3 uppercase tracking-[0.16em] text-[10px] font-medium"
      >
        <span>{reel.label}</span>
      </button>
    </div>
  );
}

export default function ReelsGallery() {
  const { openLead } = useLead();
  const scrollerRef = useRef(null);
  const [openReel, setOpenReel] = useState(null);

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
            Реальные проекты по защите <span className="gold-text">BMW</span><br /><span className="text-white">в формате видео</span>
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
            >
              <ReelCard
                reel={r}
                onOpen={setOpenReel}
                onLead={(reel) => openLead({ source: `reel-${reel.id}`, note: reel.label })}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen video player */}
      <Dialog open={!!openReel} onOpenChange={(v) => !v && setOpenReel(null)}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-[480px] w-[92vw] p-0 rounded-2xl overflow-hidden">
          <DialogTitle className="sr-only">Reel · {openReel?.id}</DialogTitle>
          <DialogDescription className="sr-only">Видео-кейс работы Detail Inspector.</DialogDescription>
          {openReel && (
            <div className="relative aspect-[9/16] bg-black">
              <video
                src={openReel.video}
                poster={openReel.poster}
                controls
                autoPlay
                playsInline
                className="w-full h-full object-contain bg-black"
              />
              <button
                onClick={() => setOpenReel(null)}
                className="absolute top-3 right-3 size-9 rounded-full bg-black/70 border border-white/20 backdrop-blur flex items-center justify-center hover:bg-black"
                aria-label="Закрыть"
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          )}
          {openReel && (
            <div className="p-4 bg-[#0a0a0a] border-t border-white/10">
              <button
                onClick={() => { const r = openReel; setOpenReel(null); openLead({ source: `reel-${r.id}`, note: r.label }); }}
                className="btn-gold w-full py-3.5 uppercase tracking-[0.18em] text-[11px] font-medium rounded-sm"
              >
                <span>{openReel.label}</span>
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
