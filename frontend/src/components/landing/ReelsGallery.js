import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useLead } from "@/lib/leadContext";
import { CDN_BASE } from "@/lib/data";
import { Play, X } from "lucide-react";

/*
 * Reels gallery — 6 cards. Each card shows the actual video as a live
 * autoplaying preview (muted, looped). Clicking a card opens a full
 * player modal with sound controls.
 *
 * Uploads: Yandex Cloud → bucket `detail-inspector/reels/<id>.mp4`
 */

const R = (path) => `${CDN_BASE}/reels/${path}`;
const REELS = [
  { id: 1, label: "Рассчитать проект защиты BMW", video: R("1.mp4"), poster: R("1.jpg"), fallback: R("reel-1.jpg") },
  { id: 2, label: "Получить персональную смету", video: R("2.mp4"), poster: R("2.jpg"), fallback: R("reel-2.jpg") },
  { id: 3, label: "Узнать стоимость оклейки", video: R("3.mp4"), poster: R("3.jpg"), fallback: R("reel-3.jpg") },
  { id: 4, label: "Оценить стоимость вашего BMW", video: R("4.mp4"), poster: R("4.jpg"), fallback: R("reel-4.jpg") },
  { id: 5, label: "Рассчитать защиту кузова", video: R("5.mp4"), poster: R("5.jpg"), fallback: R("reel-5.jpg") },
  { id: 6, label: "Получить консультацию мастера", video: R("6.mp4"), poster: R("6.jpg"), fallback: R("reel-6.jpg") },
];

async function probeUrl(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function ReelCard({ reel, onOpen }) {
  const [hasVideo, setHasVideo] = useState(false);
  const [probed, setProbed] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await probeUrl(reel.video);
      if (!alive) return;
      setHasVideo(ok);
      setProbed(true);
    })();
    return () => { alive = false; };
  }, [reel.video]);

  // Once we know the video exists, kick autoplay (muted, inline, loop).
  // Browsers occasionally swallow the very first play call on slow networks.
  useEffect(() => {
    if (!hasVideo) return;
    const el = videoRef.current;
    if (!el) return;
    const tryPlay = () => el.play().catch(() => {});
    tryPlay();
    el.addEventListener("canplay", tryPlay);
    return () => el.removeEventListener("canplay", tryPlay);
  }, [hasVideo]);

  return (
    <div className="shrink-0 w-[260px] md:w-[300px] snap-center" data-testid={`reel-${reel.id}`}>
      <button
        onClick={() => onOpen({ ...reel, hasVideo })}
        className="relative aspect-[9/16] w-full overflow-hidden bg-[#151515] rounded-[20px] border border-white/10 group block"
        aria-label="Открыть видео"
      >
        {hasVideo ? (
          <video
            ref={videoRef}
            src={reel.video}
            poster={reel.poster}
            muted
            playsInline
            loop
            autoPlay
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={reel.fallback}
            alt={`Reel ${reel.id}`}
            loading="lazy"
            className="w-full h-full object-cover"
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
        {probed && !hasVideo && (
          <div className="absolute inset-0 flex items-end justify-center pb-20 pointer-events-none">
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/50 font-mono px-3 py-1.5 bg-black/40 backdrop-blur-sm border border-white/10">
              Видео скоро
            </div>
          </div>
        )}
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
              <ReelCard reel={r} onOpen={setOpenReel} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Fullscreen video / poster viewer.
          We hide the default shadcn close button via the `[&>button.absolute]:hidden`
          arbitrary variant, so there is only ONE close icon (our custom one). */}
      <Dialog open={!!openReel} onOpenChange={(v) => !v && setOpenReel(null)}>
        <DialogContent
          className="bg-black border border-white/10 text-white p-0 rounded-2xl overflow-hidden
                     w-[92vw] max-w-[420px] max-h-[92vh]
                     grid grid-rows-[1fr_auto]
                     [&>button.absolute]:hidden"
        >
          <DialogTitle className="sr-only">Reel · {openReel?.id}</DialogTitle>
          <DialogDescription className="sr-only">Видео-кейс работы Detail Inspector.</DialogDescription>
          {openReel && (
            <div className="relative bg-black overflow-hidden min-h-0">
              {openReel.hasVideo ? (
                <video
                  src={openReel.video}
                  poster={openReel.poster}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full max-h-full object-contain bg-black"
                />
              ) : (
                <img
                  src={openReel.fallback}
                  alt={`Reel ${openReel.id}`}
                  className="w-full h-full max-h-full object-contain bg-black"
                />
              )}
              <button
                onClick={() => setOpenReel(null)}
                aria-label="Закрыть"
                className="absolute top-3 right-3 z-10 size-9 rounded-full bg-black/70 border border-white/20 backdrop-blur flex items-center justify-center hover:bg-black active:scale-95 transition-all"
              >
                <X className="size-4 text-white" />
              </button>
            </div>
          )}
          {openReel && (
            <div className="p-3 bg-[#0a0a0a] border-t border-white/10">
              <button
                onClick={() => { const r = openReel; setOpenReel(null); openLead({ source: `reel-${r.id}`, note: r.label }); }}
                className="btn-gold w-full py-3 uppercase tracking-[0.18em] text-[11px] font-medium rounded-sm"
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
