"use client";

import { useOfflineEditor } from "../context/OfflineEditorContext";

// ── Shared field wrapper ───────────────────────────────────

interface FieldProps {
  id: string;
  label: string;
  icon: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}

function Field({ id, label, icon, required, hint, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
      >
        <span>{icon}</span>
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
        {!required && (
          <span className="text-gray-300 dark:text-gray-700 font-normal normal-case tracking-normal">
            — ixtiyoriy
          </span>
        )}
      </label>
      {children}
      {hint && (
        <p className="text-[10px] text-gray-400 dark:text-gray-600">{hint}</p>
      )}
    </div>
  );
}

const TEXTAREA_BASE = `
  w-full px-4 py-3 rounded-xl border-2 text-sm leading-relaxed resize-y
  bg-white dark:bg-gray-800
  text-gray-800 dark:text-gray-100
  placeholder-gray-400 dark:placeholder-gray-500
  transition-colors duration-150
  focus:outline-none focus:border-amber-300 dark:focus:border-amber-700
  border-gray-200 dark:border-gray-700
`;

// ── Summary ────────────────────────────────────────────────

export function SummaryEditor() {
  const { state, setSummary } = useOfflineEditor();

  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📝</span>
        <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
          Qisqa mazmun
        </h2>
      </div>
      <Field
        id="offline-summary"
        label="Qisqa mazmun"
        icon=""
        hint="3–5 jumla. Kitob muqovasida ham ko'rinadi."
      >
        <textarea
          id="offline-summary"
          value={state.summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={4}
          placeholder="Ertakning qisqa mazmunini yozing. Bu kitob muqovasida va PDF da ko'rinadi..."
          className={TEXTAREA_BASE}
        />
      </Field>
    </div>
  );
}

// ── Moral lesson ───────────────────────────────────────────

export function MoralEditor() {
  const { state, setMoral } = useOfflineEditor();

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">🌟</span>
        <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
          Saboq va ota-onalar uchun izoh
        </h2>
      </div>

      <Field id="offline-moral" label="Saboq (xulosa)" icon="🌟" required>
        <textarea
          id="offline-moral"
          value={state.moralLesson}
          onChange={(e) => setMoral(e.target.value)}
          rows={3}
          placeholder="Masalan: Mehnat qilgan kishi doim muvaffaqiyatga erishadi. Dangasalik esa insonni orqaga tortadi."
          className={`${TEXTAREA_BASE} ${state.moralLesson.trim() ? "border-green-300 dark:border-green-700" : ""}`}
        />
      </Field>

      <Field
        id="offline-parent-note"
        label="Ota-onalar uchun izoh"
        icon="👨‍👩‍👧"
        hint="Ota-onalarga ertakdagi ta'limiy qiymat haqida qisqa tushuntirish."
      >
        <textarea
          id="offline-parent-note"
          value={state.parentNote}
          onChange={(e) => setMoral(e.target.value)}
          rows={2}
          placeholder="Masalan: Bu ertak orqali farzandingizga mehnat va tirishqoqlikning qadri o'rgatilyapti..."
          className={TEXTAREA_BASE}
        />
      </Field>
    </div>
  );
}

// ── Hashtags ───────────────────────────────────────────────

export function HashtagsEditor() {
  const { state, setHashtagsUz, setHashtagsEn } = useOfflineEditor();

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">📣</span>
        <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
          Xeshteglar
          <span className="text-gray-400 dark:text-gray-600 font-normal text-xs ml-2">— ixtiyoriy</span>
        </h2>
      </div>

      <Field
        id="offline-hash-uz"
        label="O'zbek xeshteglar"
        icon="🇺🇿"
        hint="Bo'sh joy bilan ajrating. # belgisi avtomatik qo'shiladi."
      >
        <input
          id="offline-hash-uz"
          type="text"
          value={state.hashtagsUzbek}
          onChange={(e) => setHashtagsUz(e.target.value)}
          placeholder="bolalaruchun ertak mehnat dostlik"
          className="w-full px-4 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-300 dark:focus:border-amber-700 transition-colors"
        />
      </Field>

      <Field
        id="offline-hash-en"
        label="English hashtags"
        icon="🌐"
        hint="Separate with spaces."
      >
        <input
          id="offline-hash-en"
          type="text"
          value={state.hashtagsEnglish}
          onChange={(e) => setHashtagsEn(e.target.value)}
          placeholder="uzbekfairytale kidsbooks storytelling"
          className="w-full px-4 py-2.5 rounded-xl border-2 text-sm bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-300 dark:focus:border-amber-700 transition-colors"
        />
      </Field>
    </div>
  );
}
