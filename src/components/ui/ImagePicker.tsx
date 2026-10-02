import { useEffect, useId, useRef, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { useTranslations } from '../../lib/i18n';

/** An image that is either already uploaded (`url`) or newly picked (`file`). */
export interface PickedImage {
  key: string;
  file?: File;
  url?: string;
}

let seq = 0;
export const pickedFromUrl = (url: string): PickedImage => ({ key: `u${seq++}`, url });
const pickedFromFile = (file: File): PickedImage => ({ key: `f${seq++}`, file });

function usePreview(img?: PickedImage) {
  const [blobUrl, setBlobUrl] = useState<string>();
  // Create and revoke inside the same effect so StrictMode's re-run can't revoke a URL still in use.
  useEffect(() => {
    if (!img?.file) return setBlobUrl(undefined);
    const u = URL.createObjectURL(img.file);
    setBlobUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [img]);
  return img?.file ? blobUrl : img?.url;
}

function Thumb({ img, onRemove, label }: { img: PickedImage; onRemove?: () => void; label: string }) {
  const src = usePreview(img);
  const tUi = useTranslations('Ui');
  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden bg-brand-cream border border-brand-dark/10">
      {src && <img src={src} alt={label} className="w-full h-full object-cover" />}
      {img.file && <span className="absolute bottom-1 start-1 text-[10px] font-semibold bg-brand-gold text-white rounded px-1.5">{tUi('newImage')}</span>}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label={tUi('removeItem', { name: label })}
          className="absolute top-1 end-1 w-7 h-7 rounded-full bg-white/90 shadow flex items-center justify-center text-brand-dark hover:bg-red-50 hover:text-red-600">
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

const ACCEPT = 'image/png,image/jpeg,image/webp,image/gif';
const MAX_MB = 5;

function validFiles(list: FileList | null, message: string, onError?: (m: string) => void): File[] {
  const files = Array.from(list ?? []);
  const ok = files.filter((f) => f.type.startsWith('image/') && f.size <= MAX_MB * 1024 * 1024);
  if (ok.length !== files.length) onError?.(message);
  return ok;
}

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  onError?: (m: string) => void;
}

export function SingleImagePicker({ value, onChange, label, error, hint, required, onError }: BaseProps & { value: PickedImage | null; onChange: (v: PickedImage | null) => void }) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const src = usePreview(value ?? undefined);
  const tUi = useTranslations('Ui');
  return (
    <div>
      <span className="block text-sm font-medium text-brand-dark mb-1.5">
        {label}
        {required && <span className="text-red-500 ms-0.5">*</span>}
      </span>
      <div className="flex items-center gap-4">
        <div className={`w-24 h-24 rounded-2xl overflow-hidden border-2 border-dashed flex items-center justify-center bg-brand-cream shrink-0 ${error ? 'border-red-400' : 'border-brand-dark/15'}`}>
          {src ? <img src={src} alt={label} className="w-full h-full object-cover" /> : <ImagePlus className="w-7 h-7 text-brand-dark/30" />}
        </div>
        <div className="flex flex-col gap-2">
          <label
            htmlFor={id}
            className="cursor-pointer inline-flex items-center justify-center h-9 px-4 rounded-full text-sm font-semibold bg-white border border-brand-dark/10 text-brand-dark hover:border-brand-gold/50 hover:bg-brand-cream transition-colors">
            {value ? tUi('changeImage') : tUi('uploadImage')}
          </label>
          <input
            ref={input}
            id={id}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            onChange={(e) => {
              const [f] = validFiles(e.target.files, tUi('imagesOnly', { n: MAX_MB }), onError);
              if (f) onChange(pickedFromFile(f));
              e.target.value = '';
            }}
          />
          {value?.file && (
            <button type="button" className="text-xs text-gray-500 hover:text-red-600 text-start" onClick={() => onChange(null)}>
              {tUi('remove')}
            </button>
          )}
        </div>
      </div>
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}

export function MultiImagePicker({
  value,
  onChange,
  label,
  error,
  hint,
  required,
  max = 5,
  onError
}: BaseProps & { value: PickedImage[]; onChange: (v: PickedImage[]) => void; max?: number }) {
  const id = useId();
  const tUi = useTranslations('Ui');
  const remaining = max - value.length;
  return (
    <div>
      <span className="block text-sm font-medium text-brand-dark mb-1.5">
        {label}
        {required && <span className="text-red-500 ms-0.5">*</span>}
        <span className="text-gray-400 font-normal ms-2">
          {value.length}/{max}
        </span>
      </span>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {value.map((img, i) => (
          <Thumb key={img.key} img={img} label={tUi('imageN', { n: i + 1 })} onRemove={() => onChange(value.filter((x) => x.key !== img.key))} />
        ))}
        {remaining > 0 && (
          <label
            htmlFor={id}
            className={`cursor-pointer aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 text-xs text-brand-dark/50 hover:border-brand-gold hover:text-brand-gold transition-colors ${error ? 'border-red-400' : 'border-brand-dark/15'}`}>
            <ImagePlus className="w-6 h-6" />
            {tUi('addImage')}
          </label>
        )}
      </div>
      <input
        id={id}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        onChange={(e) => {
          const files = validFiles(e.target.files, tUi('imagesOnly', { n: MAX_MB }), onError).slice(0, remaining);
          if (files.length) onChange([...value, ...files.map(pickedFromFile)]);
          e.target.value = '';
        }}
      />
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-gray-500">{hint}</p> : null}
    </div>
  );
}
