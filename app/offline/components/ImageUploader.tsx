"use client";

import {
  useRef,
  useState,
  useCallback,
  type DragEvent,
  type ChangeEvent,
} from "react";
import {
  Upload,
  ImageIcon,
  X,
  GripVertical,
  AlertCircle,
  Check,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import {
  fileToDataUrl,
  isImageFile,
  MAX_IMAGE_BYTES,
  type OfflineImageSlot,
} from "@/lib/utils/offline-story";
import { useOfflineEditor } from "../context/OfflineEditorContext";

// ── Single uploaded image card ─────────────────────────────

interface ImageCardProps {
  slot: OfflineImageSlot;
  onUpdateRef: (scene: number, ref: string) => void;
  onRemove: (scene: number) => void;
  onMoveUp: (scene: number) => void;
  onMoveDown: (scene: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

function ImageCard({
  slot,
  onUpdateRef,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: ImageCardProps) {
  const [editingRef, setEditingRef] = useState(false);
  const [refInput, setRefInput] = useState(slot.storyReference);

  function saveRef() {
    onUpdateRef(slot.scene, refInput);
    setEditingRef(false);
  }

  return (
    <div className="group flex gap-3 p-3 bg-white dark:bg-gray-800 rounded-2xl border border-amber-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
      {/* Reorder handles */}
      <div className="flex flex-col items-center gap-0.5 flex-shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => onMoveUp(slot.scene)}
          disabled={isFirst}
          className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-amber-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Yuqoriga"
          title="Yuqoriga ko'chirish"
        >
          ▲
        </button>
        <GripVertical size={14} className="text-gray-300 dark:text-gray-600" />
        <button
          type="button"
          onClick={() => onMoveDown(slot.scene)}
          disabled={isLast}
          className="w-5 h-5 flex items-center justify-center text-gray-300 hover:text-amber-500 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          aria-label="Pastga"
          title="Pastga ko'chirish"
        >
          ▼
        </button>
      </div>

      {/* Scene badge + thumbnail */}
      <div className="relative flex-shrink-0">
        <div className="w-16 h-16 rounded-xl overflow-hidden border border-amber-100 dark:border-gray-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.dataUrl}
            alt={`Sahna ${slot.scene}`}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-amber-400 text-white text-[10px] font-bold flex items-center justify-center shadow">
          {slot.scene}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 space-y-1.5">
        {editingRef ? (
          <div className="flex gap-1.5 items-center">
            <input
              autoFocus
              type="text"
              value={refInput}
              onChange={(e) => setRefInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveRef(); if (e.key === "Escape") setEditingRef(false); }}
              placeholder="Sahna tavsifi..."
              className="flex-1 px-2 py-1 text-xs rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-gray-900 focus:outline-none text-gray-700 dark:text-gray-200"
            />
            <button type="button" onClick={saveRef} className="w-6 h-6 rounded-lg bg-amber-400 text-white flex items-center justify-center hover:bg-amber-500 transition-colors">
              <Check size={11} />
            </button>
            <button type="button" onClick={() => setEditingRef(false)} className="w-6 h-6 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 flex items-center justify-center hover:bg-gray-200 transition-colors">
              <X size={11} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => { setRefInput(slot.storyReference); setEditingRef(true); }}
            className="text-left group/ref flex items-center gap-1"
          >
            <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 line-clamp-1">
              {slot.storyReference || <span className="text-gray-400 italic">Sahna tavsifi…</span>}
            </span>
            <Pencil size={10} className="text-gray-300 dark:text-gray-600 group-hover/ref:text-amber-400 flex-shrink-0 transition-colors" />
          </button>
        )}

        <p className="text-[10px] text-gray-400 dark:text-gray-600 truncate" title={slot.fileName}>
          {slot.fileName} · {(slot.mimeType.split("/")[1] ?? "img").toUpperCase()}
        </p>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onRemove(slot.scene)}
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all self-start mt-0.5"
        aria-label="O'chirish"
      >
        <X size={14} />
      </button>
    </div>
  );
}

// ── Drop zone ──────────────────────────────────────────────

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  disabled?: boolean;
}

function DropZone({ onFiles, disabled }: DropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleDrag(e: DragEvent, active: boolean) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(active);
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(isImageFile);
    if (files.length) onFiles(files);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).filter(isImageFile);
    if (files.length) onFiles(files);
    e.target.value = "";
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => handleDrag(e, true)}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDrop={handleDrop}
      disabled={disabled}
      className={cn(
        "w-full flex flex-col items-center justify-center gap-2 px-4 py-6 rounded-2xl",
        "border-2 border-dashed transition-all duration-150 cursor-pointer",
        "focus:outline-none focus:ring-2 focus:ring-amber-300",
        dragging
          ? "border-amber-400 bg-amber-50 dark:bg-amber-900/10 scale-[1.01]"
          : "border-amber-200 dark:border-amber-900 hover:border-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-900/10",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
        dragging ? "bg-amber-400" : "bg-amber-100 dark:bg-amber-900/30"
      )}>
        <Upload size={18} className={dragging ? "text-white" : "text-amber-500"} />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
          {dragging ? "Rasmni bu yerga tashlang!" : "Rasm yuklash"}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">
          Bosing yoki rasm torting · PNG, JPG, WebP · maks 8 MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={handleChange}
        aria-hidden="true"
      />
    </button>
  );
}

// ── Main component ─────────────────────────────────────────

export function ImageUploader() {
  const { state, addImage, updateImageRef, removeImage, reorderImage } =
    useOfflineEditor();

  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      setErrors([]);
      setUploading(true);
      const errs: string[] = [];

      for (const file of files) {
        if (!isImageFile(file)) {
          errs.push(`${file.name}: Rasm formati qo'llab-quvvatlanmaydi.`);
          continue;
        }
        if (file.size > MAX_IMAGE_BYTES) {
          errs.push(`${file.name}: Fayl hajmi 8 MB dan kichik bo'lishi kerak.`);
          continue;
        }
        try {
          const dataUrl = await fileToDataUrl(file);
          const nextScene = (state.imageSlots.length > 0
            ? Math.max(...state.imageSlots.map((s) => s.scene))
            : 0) + 1;

          const slot: OfflineImageSlot = {
            scene: nextScene,
            storyReference: `Sahna ${nextScene}`,
            dataUrl,
            fileName: file.name,
            mimeType: file.type,
          };
          addImage(slot);
        } catch {
          errs.push(`${file.name}: Yuklab bo'lmadi.`);
        }
      }

      if (errs.length) setErrors(errs);
      setUploading(false);
    },
    [state.imageSlots, addImage]
  );

  const slots = [...state.imageSlots].sort((a, b) => a.scene - b.scene);

  return (
    <div className="card p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">🖼️</span>
          <h2 className="font-display font-bold text-gray-800 dark:text-white text-sm">
            Rasmlar
            <span className="text-gray-400 dark:text-gray-600 font-normal text-xs ml-2">— ixtiyoriy</span>
          </h2>
        </div>
        {slots.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {slots.length} ta rasm
          </span>
        )}
      </div>

      {/* Drop zone */}
      <DropZone onFiles={handleFiles} disabled={uploading} />

      {/* Uploading indicator */}
      {uploading && (
        <p className="text-xs text-amber-500 font-semibold animate-pulse flex items-center gap-1.5">
          <ImageIcon size={12} /> Yuklanmoqda…
        </p>
      )}

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-xs text-red-500 flex items-start gap-1.5">
              <AlertCircle size={11} className="flex-shrink-0 mt-0.5" />
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Image cards */}
      {slots.length > 0 && (
        <div className="space-y-2">
          {slots.map((slot, idx) => (
            <ImageCard
              key={slot.scene}
              slot={slot}
              onUpdateRef={updateImageRef}
              onRemove={removeImage}
              onMoveUp={(scene) => reorderImage(scene, scene - 1)}
              onMoveDown={(scene) => reorderImage(scene, scene + 1)}
              isFirst={idx === 0}
              isLast={idx === slots.length - 1}
            />
          ))}
        </div>
      )}

      {/* Tip */}
      <p className="text-[10px] text-gray-300 dark:text-gray-700 leading-relaxed">
        💡 Har bir rasm uchun sahna tavsifi qo&apos;shing. Rasmlar PDF va kitob ko&apos;rinishida ertakka kiritiladi.
      </p>
    </div>
  );
}
