import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { BRAND } from "@/lib/data";
import { Camera, Loader2, Check, X } from "lucide-react";
import { formatPhone, isValidRuPhone } from "@/lib/phone";
import { buildLeadExtra } from "@/lib/utm";
import { toast } from "sonner";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function PhotoCTA() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+7 ");
  const [model, setModel] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const phoneRef = useRef(null);
  const fileRef = useRef(null);
  const sectionRef = useRef(null);

  const moveCaretToEnd = () => {
    const el = phoneRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      const len = el.value.length;
      try { el.setSelectionRange(len, len); } catch { /* ignore */ }
    });
  };

  const onPickPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      toast.error("Файл должен быть изображением");
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error("Фото слишком большое (макс 8 МБ)");
      return;
    }
    setPhoto(f);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(f);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isValidRuPhone(phone)) errs.phone = "Введите номер РФ: +7 и ещё 10 цифр";
    if (!model || model.trim().length < 1) errs.model = "Укажите модель BMW";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("phone", phone);
      fd.append("bmw_model", model);
      if (name) fd.append("name", name);
      fd.append("source", "photo-form");
      fd.append("note", photo ? "Прислал фото авто" : "Без фото");
      fd.append("extra", JSON.stringify(buildLeadExtra({ "Модель BMW": model })));
      if (photo) fd.append("photo", photo);
      const res = await fetch(`${API}/leads/upload`, { method: "POST", body: fd });
      if (!res.ok) throw new Error("upload-failed");
      setSent(true);
      // Scroll user back to the top of this section so they see the success
      // state right next to the form heading, not below the fold.
      requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch {
      toast.error("Не удалось отправить. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setSent(false); setName(""); setPhone("+7 "); setModel(""); removePhoto();
  };

  return (
    <section
      ref={sectionRef}
      data-testid="photo-cta-section"
      className="bg-[#0d0d0d] py-20 md:py-28"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-[1100px] mx-auto px-6 md:px-10"
      >
        <div className="text-center mb-10 md:mb-14">
          <div className="eyebrow mb-5 mx-auto inline-block">Быстрый расчёт</div>
          <h2 className="font-display text-[26px] sm:text-[34px] md:text-[56px] leading-[1.1] md:leading-[1.04] tracking-[-0.03em] mb-5 text-balance max-w-3xl mx-auto">
            Отправьте фото автомобиля и получите расчёт за{" "}
            <span className="gold-text whitespace-nowrap">15 минут</span>
          </h2>
          <p className="text-[#9a9a9a] text-base max-w-xl mx-auto leading-relaxed">
            Мастер изучит снимок кузова и подготовит предварительную смету до очного осмотра.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!sent ? (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              noValidate
              className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/10 p-6 md:p-10 rounded-sm grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <Input
                data-testid="photo-name"
                placeholder="Имя"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                className="bg-[#0d0d0d] border-white/10 text-white h-12 rounded-sm md:col-span-1"
              />
              <div className="md:col-span-1">
                <Input
                  ref={phoneRef}
                  data-testid="photo-phone"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => { setPhone(formatPhone(e.target.value)); moveCaretToEnd(); }}
                  onFocus={() => { if (!phone) setPhone("+7 "); moveCaretToEnd(); }}
                  onClick={moveCaretToEnd}
                  onKeyUp={moveCaretToEnd}
                  onKeyDown={(e) => {
                    if ((e.key === "Backspace" || e.key === "Delete") && phone.replace(/\D/g, "").length <= 1) e.preventDefault();
                    if (e.key === "Home" || e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); moveCaretToEnd(); }
                  }}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  spellCheck={false}
                  aria-invalid={!!errors.phone}
                  className={`bg-[#0d0d0d] text-white h-12 rounded-sm ${errors.phone ? "border-red-500/60" : "border-white/10"}`}
                />
                {errors.phone && <div className="text-red-400 text-[11px] mt-1.5">{errors.phone}</div>}
              </div>

              <div className="md:col-span-2">
                <Input
                  data-testid="photo-model"
                  placeholder="Модель BMW (например, X5) *"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  spellCheck={false}
                  aria-invalid={!!errors.model}
                  className={`bg-[#0d0d0d] text-white h-12 rounded-sm ${errors.model ? "border-red-500/60" : "border-white/10"}`}
                />
                {errors.model && <div className="text-red-400 text-[11px] mt-1.5">{errors.model}</div>}
              </div>

              {/* Photo upload area */}
              <div className="md:col-span-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onPickPhoto}
                  className="hidden"
                  data-testid="photo-file-input"
                />
                {!photoPreview ? (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    data-testid="photo-pick-btn"
                    className="w-full h-32 md:h-36 border border-dashed border-white/15 hover:border-white/40 bg-[#0d0d0d] rounded-sm flex flex-col items-center justify-center gap-2 transition-colors"
                  >
                    <Camera className="size-6 text-[var(--gold-3,#d4a85a)]" />
                    <div className="text-sm text-white">Прикрепить фото авто</div>
                    <div className="text-[11px] text-[#9a9a9a]">JPG / PNG / HEIC · до 8 МБ · по желанию</div>
                  </button>
                ) : (
                  <div className="relative">
                    <img src={photoPreview} alt="preview" className="w-full max-h-72 object-cover rounded-sm border border-white/10" />
                    <button
                      type="button"
                      onClick={removePhoto}
                      aria-label="Удалить фото"
                      className="absolute top-2 right-2 size-9 rounded-full bg-black/80 border border-white/20 backdrop-blur flex items-center justify-center hover:bg-black"
                    >
                      <X className="size-4 text-white" />
                    </button>
                    <div className="mt-2 text-[11px] text-[#9a9a9a]">
                      {photo?.name} · {photo ? Math.round(photo.size / 1024) : 0} КБ
                    </div>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="photo-submit"
                  className="btn-primary w-full sm:flex-1 px-8 py-4 uppercase tracking-[0.18em] text-xs font-medium disabled:opacity-50"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="size-4 animate-spin" /> : null}
                    Отправить заявку
                  </span>
                </button>
                <a
                  href={`tel:${BRAND.phoneRaw}`}
                  data-testid="photo-cta-call"
                  className="btn-ghost w-full sm:flex-1 px-8 py-4 inline-flex items-center justify-center uppercase tracking-[0.18em] text-xs font-medium text-center"
                >
                  <span>Заказать звонок</span>
                </a>
              </div>
              <p className="md:col-span-2 text-[11px] text-[#9a9a9a]/70 text-center">
                Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности.
              </p>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              data-testid="photo-success"
              className="max-w-xl mx-auto bg-[#0a0a0a] border border-white/10 p-8 md:p-12 text-center rounded-sm"
            >
              <div className="mx-auto mb-5 w-14 h-14 rounded-full bg-white flex items-center justify-center">
                <Check className="size-7 text-black" strokeWidth={2.5} />
              </div>
              <h3 className="font-display text-2xl md:text-3xl mb-3">
                {name ? `${name}, заявка принята` : "Заявка принята"}
              </h3>
              <p className="text-[#9a9a9a] text-sm mb-7 leading-relaxed">
                Мастер свяжется с вами в течение 15 минут{photo ? " и изучит фото" : ""}.
              </p>
              <button
                onClick={reset}
                className="btn-ghost px-7 py-3 uppercase tracking-[0.18em] text-[11px] font-medium"
              >
                <span>Отправить ещё одну</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
