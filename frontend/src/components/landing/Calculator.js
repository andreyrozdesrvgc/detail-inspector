import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BMW_MODELS, QUIZ_TASKS, QUIZ_CONDITIONS } from "@/lib/data";
import { calculate, submitLead } from "@/lib/api";
import { toast } from "sonner";

const steps = ["Модель BMW", "Задача", "Состояние", "Контакты"];

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export default function Calculator() {
  const [step, setStep] = useState(0);
  const [model, setModel] = useState("");
  const [task, setTask] = useState("");
  const [condition, setCondition] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const canNext =
    (step === 0 && model) ||
    (step === 1 && task) ||
    (step === 2 && condition) ||
    (step === 3 && phone && phone.replace(/\D/g, "").length >= 10);

  const goNext = async () => {
    if (step < 3) return setStep(step + 1);
    setLoading(true);
    try {
      const res = await calculate({ bmw_model: model, task, condition });
      await submitLead({
        name,
        phone,
        bmw_model: model,
        task,
        condition,
        source: "calculator",
        estimated_price: res.estimated_price,
      });
      setResult(res);
    } catch (e) {
      toast.error("Не удалось рассчитать. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(0); setModel(""); setTask(""); setCondition("");
    setName(""); setPhone(""); setResult(null);
  };

  return (
    <section
      id="calculator"
      data-testid="calculator-section"
      className="bg-[#0d0d0d] py-24 md:py-32 border-t border-white/5"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="max-w-4xl mb-12 md:mb-16">
          <div className="overline mb-5">Многошаговый расчёт</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em]">
            Узнайте точную стоимость оклейки<br />
            <span className="text-[#9a9a9a]">вашего BMW за 60 секунд</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 border border-white/10 bg-[#050505]">
          {/* Step indicator */}
          <div className="bg-[#0d0d0d] p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="overline mb-8">Шаги</div>
            <ol className="space-y-4">
              {steps.map((s, i) => {
                const active = i === step && !result;
                const done = i < step || result;
                return (
                  <li key={s} className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center justify-center size-7 border text-[11px] font-mono ${
                        done ? "bg-white text-black border-white" : active ? "border-white text-white" : "border-white/15 text-[#9a9a9a]"
                      }`}
                    >
                      {done ? <Check className="size-3.5" /> : `0${i + 1}`}
                    </span>
                    <span className={`text-sm ${active ? "text-white" : done ? "text-white/70" : "text-[#9a9a9a]"}`}>
                      {s}
                    </span>
                  </li>
                );
              })}
            </ol>
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="overline mb-3">Подарок при расчёте</div>
              <p className="text-sm text-white/80 leading-relaxed">
                Бесплатная оклейка зоны погрузки при заказе полной оклейки до конца месяца.
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 min-h-[420px] flex flex-col">
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" {...fadeIn} className="flex-1 flex flex-col" data-testid="calc-result">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                    className="size-14 rounded-full bg-white flex items-center justify-center mb-6"
                  >
                    <Check className="size-7 text-black" strokeWidth={2.5} />
                  </motion.div>
                  <div className="overline mb-3">Расчёт готов</div>
                  <h3 className="font-display text-3xl md:text-4xl mb-2">
                    {name ? `${name}, ` : ""}ваш проект уже в работе
                  </h3>
                  <p className="text-[#9a9a9a] text-sm mb-8 leading-relaxed">
                    Специалист свяжется в течение 15 минут и подготовит индивидуальное предложение.
                  </p>
                  <div className="border border-white/10 bg-[#0d0d0d] p-6 mb-6">
                    <div className="overline mb-2">Ориентировочная стоимость</div>
                    <div className="font-display text-4xl md:text-5xl tracking-tight">
                      {result.estimated_price.toLocaleString("ru-RU")} ₽
                    </div>
                    <div className="mt-3 text-sm text-[#9a9a9a]">{result.summary}</div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-sm text-white/80">
                      Подарок: <span className="text-white">{result.gift}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <a
                      href="https://t.me/detail_inspector_bot"
                      target="_blank"
                      rel="noreferrer"
                      data-testid="calc-tg-btn"
                      className="btn-primary px-6 py-3.5 uppercase tracking-[0.18em] text-[11px] font-medium"
                    >
                      <span>Закрепить расчёт и записаться</span>
                    </a>
                    <button
                      onClick={reset}
                      data-testid="calc-reset-btn"
                      className="btn-ghost px-6 py-3.5 uppercase tracking-[0.18em] text-[11px] font-medium"
                    >
                      <span>Новый расчёт</span>
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key={step} {...fadeIn} className="flex-1 flex flex-col">
                  <div className="overline mb-3">Шаг {step + 1} из 4</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-8 leading-tight">
                    {step === 0 && "Выберите модель BMW"}
                    {step === 1 && "Какая задача?"}
                    {step === 2 && "Состояние автомобиля"}
                    {step === 3 && "Куда отправить расчёт?"}
                  </h3>

                  <div className="flex-1">
                    {step === 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BMW_MODELS.map((m) => (
                          <button
                            key={m}
                            onClick={() => setModel(m)}
                            data-testid={`calc-model-${m}`}
                            className={`border text-sm py-4 px-3 text-left transition-all ${
                              model === m ? "bg-white text-black border-white" : "border-white/10 text-white hover:border-white/40"
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 1 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUIZ_TASKS.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => setTask(t.label)}
                            data-testid={`calc-task-${t.id}`}
                            className={`border p-5 text-left transition-all ${
                              task === t.label ? "bg-white text-black border-white" : "border-white/10 text-white hover:border-white/40"
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">{t.label}</div>
                            <div className={`text-xs ${task === t.label ? "text-black/70" : "text-[#9a9a9a]"}`}>{t.hint}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid grid-cols-1 gap-2">
                        {QUIZ_CONDITIONS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setCondition(c.label)}
                            data-testid={`calc-cond-${c.id}`}
                            className={`border p-5 text-left transition-all ${
                              condition === c.label ? "bg-white text-black border-white" : "border-white/10 text-white hover:border-white/40"
                            }`}
                          >
                            <div className="text-sm font-medium mb-1">{c.label}</div>
                            <div className={`text-xs ${condition === c.label ? "text-black/70" : "text-[#9a9a9a]"}`}>{c.hint}</div>
                          </button>
                        ))}
                      </div>
                    )}

                    {step === 3 && (
                      <div className="space-y-3 max-w-md">
                        <Input
                          data-testid="calc-name-input"
                          placeholder="Имя"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="bg-[#0d0d0d] border-white/10 text-white h-12 rounded-sm"
                        />
                        <Input
                          data-testid="calc-phone-input"
                          placeholder="+7 (___) ___-__-__"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          type="tel"
                          className="bg-[#0d0d0d] border-white/10 text-white h-12 rounded-sm"
                        />
                        <p className="text-xs text-[#9a9a9a] pt-2">
                          Пришлём расчёт по {model || "BMW"} в течение 15 минут.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                    <button
                      onClick={() => setStep(Math.max(0, step - 1))}
                      disabled={step === 0}
                      data-testid="calc-back-btn"
                      className="text-xs uppercase tracking-[0.18em] text-[#9a9a9a] hover:text-white inline-flex items-center gap-2 disabled:opacity-30"
                    >
                      <ArrowLeft className="size-4" /> Назад
                    </button>
                    <button
                      onClick={goNext}
                      disabled={!canNext || loading}
                      data-testid="calc-next-btn"
                      className="btn-primary px-7 py-3 uppercase tracking-[0.18em] text-[11px] font-medium disabled:opacity-40 disabled:pointer-events-none"
                    >
                      <span className="inline-flex items-center gap-2">
                        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                        {step === 3 ? "Получить расчёт" : "Далее"}
                        {step < 3 && !loading ? <ArrowRight className="size-4" /> : null}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
