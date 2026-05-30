import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { submitLead } from "@/lib/api";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export default function FinalCTA() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [model, setModel] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Укажите корректный номер телефона");
      return;
    }
    setLoading(true);
    try {
      await submitLead({ name, phone, bmw_model: model, source: "final-cta", note: "Бесплатный осмотр" });
      setDone(true);
    } catch {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      data-testid="final-cta-section"
      className="bg-[#050505] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="overline mb-5">Запись на осмотр</div>
          <h2 className="font-display text-[36px] md:text-[64px] leading-[1.0] tracking-[-0.04em] mb-6">
            Готовы защитить ваш&nbsp;BMW<br />
            <span className="text-[#9a9a9a]">по высшему стандарту?</span>
          </h2>
          <p className="text-[#9a9a9a] text-base md:text-lg max-w-md leading-relaxed">
            Очный аудит ЛКП занимает 40 минут и проводится бесплатно. После осмотра вы получаете смету до рубля и план работ.
          </p>
        </motion.div>

        <motion.form
          onSubmit={onSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0d0d0d] border border-white/10 p-8 md:p-12"
          data-testid="final-cta-form"
        >
          {done ? (
            <div className="text-center py-10" data-testid="final-cta-success">
              <div className="mx-auto mb-6 size-14 rounded-full bg-white flex items-center justify-center">
                <Check className="size-7 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-3xl mb-3">Заявка принята</h3>
              <p className="text-[#9a9a9a] text-sm">Свяжемся в течение 15 минут.</p>
            </div>
          ) : (
            <>
              <div className="overline mb-6">Бесплатный осмотр</div>
              <div className="space-y-3">
                <Input
                  data-testid="final-cta-name"
                  placeholder="Имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#050505] border-white/10 text-white h-12 rounded-sm"
                />
                <Input
                  data-testid="final-cta-phone"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  type="tel"
                  required
                  className="bg-[#050505] border-white/10 text-white h-12 rounded-sm"
                />
                <Input
                  data-testid="final-cta-model"
                  placeholder="Модель BMW"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-[#050505] border-white/10 text-white h-12 rounded-sm"
                />
                <button
                  type="submit"
                  data-testid="final-cta-submit"
                  disabled={loading}
                  className="btn-primary w-full py-4 mt-2 uppercase tracking-[0.18em] text-[11px] font-medium"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                    Записаться на бесплатный осмотр
                  </span>
                </button>
                <p className="text-[#9a9a9a]/70 text-[11px] pt-2">
                  Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности
                </p>
              </div>
            </>
          )}
        </motion.form>
      </div>
    </section>
  );
}
