import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLead } from "@/lib/leadContext";
import { Calculator } from "lucide-react";

export default function MobileCTA() {
  const { openLead } = useLead();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 800);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-t border-white/10 p-3"
          style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={() => openLead({ source: "mobile-fab" })}
            data-testid="mobile-fab"
            className="btn-primary w-full py-4 uppercase tracking-[0.18em] text-[11px] font-medium inline-flex items-center justify-center gap-2"
          >
            <span className="inline-flex items-center gap-2"><Calculator className="size-4" /> Рассчитать стоимость</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
