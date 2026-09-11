import * as React from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { IMAGE_MAX_BYTES } from '@olesia/shared';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';
import { uploadImage } from '@/features/about/data';
const a = ro.about;

/**
 * Controlled image gallery. Uploads each file to the storage module and keeps
 * only the returned URL (never base64 in the page payload).
 */
export function ImagesField({
  value,
  onChange,
}: {
  value: string[];
  onChange: (urls: string[]) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  // Latest value, so concurrent uploads append rather than overwrite.
  const valueRef = React.useRef(value);
  valueRef.current = value;

  const handleFiles: React.ChangeEventHandler<HTMLInputElement> = async (
    ev,
  ) => {
    const files = Array.from(ev.target.files ?? []);
    ev.target.value = '';
    if (files.length === 0) return;

    const accepted = files.filter((f) => {
      if (f.size > IMAGE_MAX_BYTES) {
        toast.error(a.toast.imageTooLarge);
        return false;
      }
      return true;
    });
    if (accepted.length === 0) return;

    setUploading(true);
    try {
      for (const file of accepted) {
        const url = await uploadImage(file);
        onChange([...valueRef.current, url]);
      }
    } catch {
      toast.error(a.toast.uploadError);
    } finally {
      setUploading(false);
    }
  };

  const removeAt = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        {value.map((src, i) => (
          <div
            key={i}
            className="group relative aspect-video overflow-hidden rounded-lg border bg-muted"
          >
            <img src={src} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label={a.removeImage}
              className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-md bg-foreground/70 text-background opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className={cn(
            'flex aspect-video flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-ring hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60',
            value.length === 0 && 'col-span-2',
          )}
        >
          {uploading ? (
            <Loader2 className="size-5 animate-spin" strokeWidth={1.75} />
          ) : (
            <ImagePlus className="size-5" strokeWidth={1.75} />
          )}
          <span className="text-xs font-medium">
            {uploading ? a.uploading : a.addImage}
          </span>
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {value.length === 0 ? a.noImages : a.imagesHint}
      </p>

      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
    </div>
  );
}
