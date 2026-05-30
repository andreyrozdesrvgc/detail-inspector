import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/api";
import { toast } from "sonner";
import { X, Send, Loader2 } from "lucide-react";

export default function ExitIntent() {
  const [open, setOpen] = useState(false);
  const fired = useRef(false);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const onLeave = (e) => {
      if (fired.current) return;
      if (e.clientY < 10) {
        fired.current = true;
        setOpen(true);
      }
    };
    document.addEventListener("mouseleave", onLeave);
    return () => document.removeEventListener("mouseleave", onLeave);
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Укажите номер телефона");
      return;
    }
    setLoading(true);
    try {
      await submitLead({ phone, source: "exit-intent" });
      setDone(true);
    } catch {
      toast.error("Не удалось отправить");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        data-testid="exit-intent-dialog"
        className="bg-[#0a0a0a] border border-white/10 text-white max-w-md p-0 rounded-sm overflow-hidden"
      >
        <DialogTitle className="sr-only">Уходите? Оставьте телефон</DialogTitle>
        <DialogDescription className="sr-only">Получите персональный расчёт стоимости защиты BMW.</DialogDescription>
        <button
          onClick={() => setOpen(false)}
          data-testid="exit-intent-close"
          className="absolute right-4 top-4 text-white/60 hover:text-white"
          aria-label="Закрыть"
        >
          <X className="size-5" />
        </button>
        <AnimatePresence mode="wait">
          {done ? (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10 text-center">
              <div className="overline mb-3">Готово</div>
              <h3 className="font-display text-2xl mb-3">Расчёт отправим в течение 15 минут</h3>
              <p className="text-sm text-[#9a9a9a]">Подарок в силе — бесплатная оклейка зоны погрузки.</p>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-10">
              <div className="overline mb-4">Уходите?</div>
              <h3 className="font-display text-2xl md:text-3xl mb-3 leading-tight">
                Отправьте фото автомобиля<br /><span className="text-[#9a9a9a]">и получите расчёт</span>
              </h3>
              <p className="text-sm text-[#9a9a9a] mb-6 leading-relaxed">
                Оставьте телефон — пришлём расчёт + подарок: бесплатная оклейка зоны погрузки.
              </p>
              <form onSubmit={onSubmit} className="space-y-3">
                <Input
                  data-testid="exit-intent-phone"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  className="bg-[#151515] border-white/10 text-white h-12 rounded-sm"
                />
                <button
                  type="submit"
                  data-testid="exit-intent-submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 uppercase tracking-[0.18em] text-[11px] font-medium"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                    Получить расчёт + подарок
                  </span>
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
