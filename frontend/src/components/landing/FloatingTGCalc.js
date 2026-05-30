import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLead } from "@/lib/leadContext";
import { Calculator as CalcIcon, X } from "lucide-react";

export default function FloatingTGCalc() {
  const { openLead } = useLead();
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (closed) return;
      setVisible(window.scrollY > 1200);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [closed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hidden md:flex fixed top-[88px] right-6 z-40 items-center gap-3 bg-[#0d0d0d]/95 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-sm"
          data-testid="floating-tg-calc"
        >
          <CalcIcon className="size-4 text-white/70" />
          <div className="text-xs text-white/85 leading-tight">
            Онлайн-калькулятор<br />
            <button
              onClick={() => openLead({ source: "floating-tg" })}
              className="text-white underline underline-offset-4 hover:no-underline"
              data-testid="floating-tg-link"
            >
              расчёт за 60 сек →
            </button>
          </div>
          <button
            onClick={() => { setClosed(true); setVisible(false); }}
            className="text-white/40 hover:text-white"
            aria-label="Закрыть"
            data-testid="floating-tg-close"
          >
            <X className="size-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
