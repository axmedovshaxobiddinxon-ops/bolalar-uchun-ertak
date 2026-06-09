"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Users } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Character, CharacterRole } from "@/types";
import { useOfflineEditor } from "../context/OfflineEditorContext";

const ROLE_OPTIONS: { value: CharacterRole; label: string; color: string }[] = [
  { value: "protagonist", label: "Asosiy qahramon", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  { value: "mentor",      label: "Ustoz",            color: "bg-sky-100   text-sky-700   dark:bg-sky-900/30   dark:text-sky-400"   },
  { value: "antagonist",  label: "Raqib",            color: "bg-red-100   text-red-700   dark:bg-red-900/30   dark:text-red-400"   },
  { value: "supporting",  label: "Yordamchi",        color: "bg-gray-100  text-gray-600  dark:bg-gray-700     dark:text-gray-400"  },
];

const BLANK: Character = { name: "", role: "protagonist", visualSeed: "" };

// ── Inline editor ──────────────────────────────────────────

interface InlineEditorProps {
  initial: Character;
  onSave: (c: Character) => void;
  onCancel: () => void;
}

function InlineEditor({ initial, onSave, onCancel }: InlineEditorProps) {
  const [c, setC] = useState<Character>(initial);

  const valid = c.name.trim().length > 0;

  return (
    <div className="p-4 bg-amber-50 dark:bg-gray-800 rounded-2xl border border-amber-200 dark:border-gray-700 space-y-3">
      {/* Name */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Ism <span className="text-red-400">*</span>
        </label>
        <input
          autoFocus
          type="text"
          value={c.name}
          onChange={(e) => setC({ ...c, name: e.target.value })}
          placeholder="Qahramon ismi"
          className="w-full px-3 py-2 text-sm rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:outline-none focus:border-amber-400 dark:focus:border-amber-600"
        />
      </div>

      {/* Role */}
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Rol
        </label>
        <div className="flex flex-wrap gap-2">
          {ROLE_OPTIONS.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setC({ ...c, role: value })}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-semibold border-2 transition-all",
                c.role === value
                  ? `${color} border-current ring-2 ring-amber-300`
                  : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 hover:border-amber-300"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual seed */}
      <div className="space-y-1">
        <label className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          Tasviriy tavsif (inglizcha)
          <span className="text-gray-400 dark:text-gray-600 font-normal ml-1">— rasm uchun</span>
        </label>
        <textarea
          value={c.visualSeed}
          onChange={(e) => setC({ ...c, visualSeed: e.target.value })}
          rows={2}
          placeholder="e.g. a 7-year-old Uzbek boy with dark hair, wearing a blue doppi hat and green chapan"
          className="w-full px-3 py-2 text-xs rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 resize-none focus:outline-none focus:border-amber-400 dark:focus:border-amber-600 placeholder-gray-400 dark:placeholder-gray-600"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => valid && onSave(c)}
          disabled={!valid}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 text-white hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Check size={12} /> Saqlash
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 transition-all"
        >
          <X size={12} /> Bekor
        </button>
      </div>
    </div>
  );
}

// ── Character card ─────────────────────────────────────────

interface CharCardProps {
  char: Character;
  index: number;
  onEdit: () => void;
  onDelete: () => void;
}

function CharCard({ char, index, onEdit, onDelete }: CharCardProps) {
  const roleInfo = ROLE_OPTIONS.find((r) => r.value === char.role) ?? ROLE_OPTIONS[3];

  return (
    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      {/* Avatar */}
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {char.name?.[0]?.toUpperCase() ?? (index + 1)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="font-bold text-sm text-gray-800 dark:text-gray-100">{char.name}</span>
          <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", roleInfo.color)}>
            {roleInfo.label}
          </span>
        </div>
        {char.visualSeed && (
          <p className="text-[11px] text-gray-400 dark:text-gray-500 italic line-clamp-1">
            {char.visualSeed}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          type="button"
          onClick={onEdit}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all"
          aria-label="Tahrirlash"
        >
          <Pencil size={13} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          aria-label="O'chirish"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────

export function CharactersEditor() {
  const { state, addCharacter, updateCharacter, removeCharacter } = useOfflineEditor();
  const [addingNew, setAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handleSaveNew(c: Character) {
    addCharacter(c);
    setAddingNew(false);
  }

  function handleSaveEdit(c: Character) {
    if (editingIndex === null) return;
    updateCharacter(editingIndex, c);
    setEditingIndex(null);
  }

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">👥</span>
          <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
            Qahramonlar
            <span className="text-gray-400 dark:text-gray-600 font-normal text-xs ml-2">— ixtiyoriy</span>
          </h2>
        </div>
        {state.characters.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {state.characters.length} ta
          </span>
        )}
      </div>

      {/* Empty state */}
      {state.characters.length === 0 && !addingNew && (
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <Users size={28} className="text-amber-200 dark:text-gray-700 mb-2" />
          <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">
            Hali qahramonlar qo&apos;shilmagan
          </p>
          <p className="text-xs text-gray-300 dark:text-gray-700 mt-0.5">
            Qahramonlar PDF da va kitob ko&apos;rinishida ko&apos;rsatiladi
          </p>
        </div>
      )}

      {/* Character list */}
      <div className="space-y-2">
        {state.characters.map((char, idx) =>
          editingIndex === idx ? (
            <InlineEditor
              key={idx}
              initial={char}
              onSave={handleSaveEdit}
              onCancel={() => setEditingIndex(null)}
            />
          ) : (
            <CharCard
              key={idx}
              char={char}
              index={idx}
              onEdit={() => { setAddingNew(false); setEditingIndex(idx); }}
              onDelete={() => removeCharacter(idx)}
            />
          )
        )}
      </div>

      {/* New character inline editor */}
      {addingNew && (
        <InlineEditor
          initial={BLANK}
          onSave={handleSaveNew}
          onCancel={() => setAddingNew(false)}
        />
      )}

      {/* Add button */}
      {!addingNew && editingIndex === null && (
        <button
          type="button"
          onClick={() => setAddingNew(true)}
          className="
            w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
            border-2 border-dashed border-amber-300 dark:border-amber-800
            text-amber-600 dark:text-amber-500 text-sm font-semibold
            hover:bg-amber-50 dark:hover:bg-amber-900/10
            transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-300
          "
        >
          <Plus size={15} />
          Qahramon qo&apos;shish
        </button>
      )}
    </div>
  );
}
