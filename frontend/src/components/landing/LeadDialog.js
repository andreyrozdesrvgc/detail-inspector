import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLead } from "@/lib/leadContext";
import { submitLead } from "@/lib/api";
import { formatPhone, isValidRuPhone } from "@/lib/phone";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";

export default function LeadDialog() {
  const { open, source, prefill, closeLead } = useLead();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7 ");
  const [model, setModel] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(1);
      setErrors({});
      setName(prefill?.name || "");
      setPhone(formatPhone(prefill?.phone) || "+7 ");
      setModel(prefill?.bmw_model || "");
    }
  }, [open, prefill]);

  const onPhoneChange = (e) => setPhone(formatPhone(e.target.value));
  const onPhoneFocus = () => { if (!phone || phone === "") setPhone("+7 "); };
  const onPhoneKeyDown = (e) => {
    // Prevent deleting the "+7 " prefix entirely.
    if ((e.key === "Backspace" || e.key === "Delete") && phone.replace(/\D/g, "").length <= 1) {
      e.preventDefault();
    }
  };

  const validate = () => {
    const errs = {};
    if (!isValidRuPhone(phone)) errs.phone = "Введите номер РФ: +7 и ещё 10 цифр";
    if (!model || model.trim().length < 2) errs.model = "Укажите модель BMW";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await submitLead({
        name,
        phone,
        bmw_model: model,
        source,
        note: prefill?.note,
      });
      setStep(2);
    } catch (err) {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && closeLead()}>
      <DialogContent
        data-testid="lead-dialog"
        className="bg-[#0a0a0a] border border-white/10 text-white max-w-lg p-0 rounded-sm overflow-hidden"
      >
        <DialogTitle className="sr-only">Получите расчёт защиты BMW</DialogTitle>
        <DialogDescription className="sr-only">Форма заявки на персональный расчёт стоимости оклейки BMW.</DialogDescription>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="p-10"
            >
              <div className="eyebrow mb-6">Detail Inspector · BMW</div>
              <h3 className="font-display text-3xl md:text-4xl leading-[1.05] mb-4">
                Получите персональный расчёт защиты BMW
              </h3>
              <p className="text-[#9a9a9a] text-sm mb-8 leading-relaxed">
                Специалист свяжется в течение 15 минут и подготовит индивидуальное предложение под ваш автомобиль.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  data-testid="lead-name-input"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#151515] border-white/10 text-white h-12 rounded-sm"
                />
                <div>
                  <Input
                    data-testid="lead-phone-input"
                    placeholder="+7 (___) ___-__-__"
                    value={phone}
                    onChange={onPhoneChange}
                    onFocus={onPhoneFocus}
                    onKeyDown={onPhoneKeyDown}
                    type="tel"
                    inputMode="tel"
                    required
                    aria-invalid={!!errors.phone}
                    className={`bg-[#151515] text-white h-12 rounded-sm ${errors.phone ? "border-red-500/60" : "border-white/10"}`}
                  />
                  {errors.phone && <div className="text-red-400 text-[11px] mt-1.5" data-testid="lead-phone-error">{errors.phone}</div>}
                </div>
                <div>
                  <Input
                    data-testid="lead-model-input"
                    placeholder="Модель BMW (например, X5 G05) *"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    required
                    aria-invalid={!!errors.model}
                    className={`bg-[#151515] text-white h-12 rounded-sm ${errors.model ? "border-red-500/60" : "border-white/10"}`}
                  />
                  {errors.model && <div className="text-red-400 text-[11px] mt-1.5" data-testid="lead-model-error">{errors.model}</div>}
                </div>

                <button
                  type="submit"
                  data-testid="lead-submit-btn"
                  disabled={loading}
                  className="btn-primary w-full h-12 mt-4 uppercase tracking-[0.18em] text-xs font-medium"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                    Получить расчёт
                  </span>
                </button>
                <p className="text-[#9a9a9a]/60 text-[11px] text-center pt-2">
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="p-10 text-center"
              data-testid="lead-success"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}
                className="mx-auto mb-6 w-16 h-16 rounded-full bg-white flex items-center justify-center"
              >
                <Check className="size-8 text-black" strokeWidth={2.5} />
              </motion.div>
              <h3 className="font-display text-3xl mb-3">
                {name ? `${name}, ваш проект уже в работе` : "Ваш проект уже в работе"}
              </h3>
              <p className="text-[#9a9a9a] text-sm mb-8 leading-relaxed max-w-sm mx-auto">
                Специалист свяжется в течение 15 минут и подготовит расчёт под ваш автомобиль.
              </p>
              <button
                onClick={closeLead}
                data-testid="lead-success-close"
                className="btn-ghost inline-block px-8 py-3 uppercase tracking-[0.18em] text-xs font-medium"
              >
                <span>Закрыть</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
