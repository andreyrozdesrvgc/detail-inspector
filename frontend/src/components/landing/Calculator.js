import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Loader2, Gift } from "lucide-react";
import { Input } from "@/components/ui/input";
import { BMW_MODELS, QUIZ_TASKS, QUIZ_CONDITIONS } from "@/lib/data";
import { calculate, submitLead } from "@/lib/api";
import { toast } from "sonner";

const stepLabels = ["Модель BMW", "Задача", "Состояние", "Контакты"];

const fadeIn = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
};

export default function Calculator() {
  const [phase, setPhase] = useState("step1"); // step1 | step2 | step3 | loading | preview | contact | done
  const [model, setModel] = useState("");
  const [task, setTask] = useState("");
  const [condition, setCondition] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [intent, setIntent] = useState(""); // inspect | consult
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Map phase -> step indicator
  const indicatorIdx =
    phase === "step1" ? 0 :
    phase === "step2" ? 1 :
    phase === "step3" ? 2 :
    phase === "preview" || phase === "loading" ? 2 :
    phase === "contact" ? 3 : 4;

  const onSelectModel = (m) => {
    setModel(m);
    setTimeout(() => setPhase("step2"), 220);
  };
  const onSelectTask = (label) => {
    setTask(label);
    setTimeout(() => setPhase("step3"), 220);
  };
  const onSelectCondition = async (label) => {
    setCondition(label);
    setTimeout(async () => {
      setPhase("loading");
      try {
        const res = await calculate({ bmw_model: model, task, condition: label });
        setPreview(res);
        setPhase("preview");
      } catch {
        toast.error("Не удалось рассчитать. Попробуйте ещё раз.");
        setPhase("step3");
      }
    }, 220);
  };

  const chooseIntent = (i) => {
    setIntent(i);
    setPhase("contact");
  };

  const submitContact = async (e) => {
    e.preventDefault();
    if (!phone || phone.replace(/\D/g, "").length < 10) {
      toast.error("Укажите корректный номер телефона");
      return;
    }
    setLoading(true);
    try {
      await submitLead({
        name,
        phone,
        bmw_model: model,
        task,
        condition,
        source: `calculator-${intent || "default"}`,
        estimated_price: preview?.estimated_price,
        note: intent === "inspect" ? "Бесплатный осмотр" : intent === "consult" ? "Консультация" : null,
      });
      setResult(preview);
      setPhase("done");
    } catch {
      toast.error("Не удалось отправить.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setPhase("step1"); setModel(""); setTask(""); setCondition("");
    setName(""); setPhone(""); setIntent(""); setPreview(null); setResult(null);
  };

  const goBack = () => {
    if (phase === "step2") setPhase("step1");
    else if (phase === "step3") setPhase("step2");
    else if (phase === "preview") setPhase("step3");
    else if (phase === "contact") setPhase("preview");
  };

  return (
    <section
      id="calculator"
      data-testid="calculator-section"
      className="bg-[#0d0d0d] py-24 md:py-32"
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <div className="max-w-4xl mb-12 md:mb-16">
          <div className="eyebrow mb-6">Многошаговый расчёт</div>
          <h2 className="font-display text-[34px] md:text-[56px] leading-[1.02] tracking-[-0.03em]">
            Узнайте точную стоимость оклейки<br />
            <span className="text-white">вашего BMW за 60 секунд</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-8 border border-white/10 bg-[#050505]">
          {/* Step indicator */}
          <div className="bg-[#0d0d0d] p-8 md:p-10 border-b lg:border-b-0 lg:border-r border-white/10">
            <div className="eyebrow mb-8">Шаги</div>
            <ol className="space-y-4">
              {stepLabels.map((s, i) => {
                const active = i === indicatorIdx;
                const done = i < indicatorIdx;
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

            {/* Gift box with gold running border */}
            <div className="mt-10 pt-8 border-t border-white/10">
              <div className="gold-frame relative bg-[#0a0a0a] p-5">
                <div className="flex items-start gap-3">
                  <Gift className="size-5 text-[var(--gold-3)] shrink-0 mt-0.5" strokeWidth={1.6} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] mb-1.5 gold-text font-semibold">
                      Подарок при расчёте
                    </div>
                    <p className="text-sm text-white/85 leading-relaxed">
                      Бесплатная оклейка зоны погрузки при заказе полной оклейки до конца месяца.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 min-h-[460px] flex flex-col">
            <AnimatePresence mode="wait">
              {phase === "done" && result && (
                <motion.div key="done" {...fadeIn} className="flex-1 flex flex-col" data-testid="calc-result">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 18 }}
                    className="size-14 rounded-full bg-white flex items-center justify-center mb-6"
                  >
                    <Check className="size-7 text-black" strokeWidth={2.5} />
                  </motion.div>
                  <div className="eyebrow mb-3">Расчёт готов</div>
                  <h3 className="font-display text-3xl md:text-4xl mb-2">
                    {name ? `${name}, ` : ""}ваш проект уже в работе
                  </h3>
                  <p className="text-[#9a9a9a] text-sm mb-8 leading-relaxed">
                    Специалист свяжется в течение 15 минут и подготовит индивидуальное предложение.
                  </p>
                  <div className="border border-white/10 bg-[#0d0d0d] p-6 mb-6">
                    <div className="eyebrow mb-3">Ориентировочная стоимость</div>
                    <div className="font-display text-4xl md:text-5xl tracking-tight">
                      <span className="gold-text">от {result.estimated_price.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <div className="mt-3 text-sm text-[#9a9a9a]">{result.summary}</div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-sm text-white/80">
                      Подарок: <span className="text-white">{result.gift}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <button
                      onClick={reset}
                      data-testid="calc-reset-btn"
                      className="btn-ghost px-6 py-3.5 uppercase tracking-[0.18em] text-[11px] font-medium"
                    >
                      <span>Новый расчёт</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === "contact" && (
                <motion.div key="contact" {...fadeIn} className="flex-1 flex flex-col">
                  <div className="eyebrow mb-4">Шаг 4 из 4</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-3 leading-tight">
                    Куда отправить расчёт?
                  </h3>
                  <p className="text-sm text-[#9a9a9a] mb-6">
                    {intent === "inspect"
                      ? "Согласуем удобное время для бесплатного осмотра."
                      : intent === "consult"
                      ? "Мастер свяжется и ответит на ваши вопросы."
                      : "Пришлём расчёт в течение 15 минут."}
                  </p>
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
                  </div>
                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                    <button onClick={goBack} data-testid="calc-back-btn" className="text-xs uppercase tracking-[0.18em] text-[#9a9a9a] hover:text-white inline-flex items-center gap-2">
                      <ArrowLeft className="size-4" /> Назад
                    </button>
                    <button
                      onClick={submitContact}
                      disabled={loading}
                      data-testid="calc-next-btn"
                      className="btn-primary px-7 py-3 uppercase tracking-[0.18em] text-[11px] font-medium disabled:opacity-40"
                    >
                      <span className="inline-flex items-center gap-2">
                        {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                        Получить расчёт
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === "preview" && preview && (
                <motion.div key="preview" {...fadeIn} className="flex-1 flex flex-col" data-testid="calc-preview">
                  <div className="eyebrow mb-4">Предварительный расчёт</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-2 leading-tight">
                    {model}
                  </h3>
                  <p className="text-sm text-[#9a9a9a] mb-8">{preview.summary}</p>

                  <div className="border border-white/10 bg-[#0d0d0d] p-6 mb-8">
                    <div className="eyebrow mb-3">Ориентировочная стоимость</div>
                    <div className="font-display text-5xl md:text-6xl tracking-tight">
                      <span className="gold-text">от {preview.estimated_price.toLocaleString("ru-RU")} ₽</span>
                    </div>
                    <p className="mt-4 pt-4 border-t border-white/5 text-xs text-[#9a9a9a] leading-relaxed">
                      Финальная стоимость согласуется после очного осмотра кузова и фиксируется в заказ-наряде.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                    <button
                      onClick={() => chooseIntent("inspect")}
                      data-testid="calc-preview-inspect"
                      className="btn-primary w-full py-4 uppercase tracking-[0.18em] text-[11px] font-medium"
                    >
                      <span>Записаться на бесплатный осмотр</span>
                    </button>
                    <button
                      onClick={() => chooseIntent("consult")}
                      data-testid="calc-preview-consult"
                      className="btn-ghost w-full py-4 uppercase tracking-[0.18em] text-[11px] font-medium"
                    >
                      <span>Получить бесплатную консультацию</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {phase === "loading" && (
                <motion.div key="loading" {...fadeIn} className="flex-1 flex items-center justify-center" data-testid="calc-loading">
                  <div className="flex flex-col items-center gap-3 text-[#9a9a9a]">
                    <Loader2 className="size-7 animate-spin" />
                    <div className="eyebrow">Считаем стоимость</div>
                  </div>
                </motion.div>
              )}

              {(phase === "step1" || phase === "step2" || phase === "step3") && (
                <motion.div key={phase} {...fadeIn} className="flex-1 flex flex-col">
                  <div className="eyebrow mb-4">Шаг {indicatorIdx + 1} из 4</div>
                  <h3 className="font-display text-2xl md:text-3xl mb-8 leading-tight">
                    {phase === "step1" && <>Выберите модель <span className="gold-text">BMW</span></>}
                    {phase === "step2" && "Какая задача?"}
                    {phase === "step3" && "Состояние автомобиля"}
                  </h3>

                  <div className="flex-1">
                    {phase === "step1" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {BMW_MODELS.map((m) => (
                          <button
                            key={m}
                            onClick={() => onSelectModel(m)}
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

                    {phase === "step2" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {QUIZ_TASKS.map((t) => (
                          <button
                            key={t.id}
                            onClick={() => onSelectTask(t.label)}
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

                    {phase === "step3" && (
                      <div className="grid grid-cols-1 gap-2">
                        {QUIZ_CONDITIONS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => onSelectCondition(c.label)}
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
                  </div>

                  <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6">
                    <button
                      onClick={goBack}
                      disabled={phase === "step1"}
                      data-testid="calc-back-btn"
                      className="text-xs uppercase tracking-[0.18em] text-[#9a9a9a] hover:text-white inline-flex items-center gap-2 disabled:opacity-30"
                    >
                      <ArrowLeft className="size-4" /> Назад
                    </button>
                    <div className="text-xs text-[#9a9a9a] uppercase tracking-[0.18em] inline-flex items-center gap-2">
                      Авто-переход <ArrowRight className="size-4" />
                    </div>
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
