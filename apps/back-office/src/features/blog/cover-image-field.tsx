import * as React from 'react';
import { ImagePlus, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { IMAGE_MAX_BYTES } from '@olesia/shared';
import { ro } from '@/i18n/ro';
import { uploadImage } from '@/features/blog/data';

/**
 * Cover image upload. Uploads to the storage module (converted to WebP) and
 * keeps the returned URL — never base64 in the post payload.
 */
export function CoverImageField({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);
  const e = ro.blog.editor;

  const handleFile: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    if (file.size > IMAGE_MAX_BYTES) {
      toast.error(ro.blog.toast.coverTooLarge);
      return;
    }
    setUploading(true);
    try {
      onChange(await uploadImage(file));
    } catch {
      toast.error(ro.blog.toast.coverUploadError);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {value ? (
        <>
          <div className="relative aspect-video overflow-hidden rounded-lg border bg-muted">
            <img
              src={value}
              alt=""
              className="size-full object-cover"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploading}
              onClick={() => ref.current?.click()}
            >
              {uploading ? <Loader2 className="animate-spin" /> : <Upload />}
              {uploading ? e.uploadingCover : e.replaceCover}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={uploading}
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              onClick={() => onChange(null)}
            >
              <Trash2 />
              {e.removeCover}
            </Button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          disabled={uploading}
          className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/30 text-muted-foreground transition-colors hover:border-ring hover:bg-accent/40 focus-visible:ring-[3px] focus-visible:ring-ring/40 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {uploading ? (
            <Loader2 className="size-6 animate-spin" strokeWidth={1.75} />
          ) : (
            <ImagePlus className="size-6" strokeWidth={1.75} />
          )}
          <span className="text-sm font-medium">
            {uploading ? e.uploadingCover : e.uploadCover}
          </span>
          <span className="text-xs">{e.coverHint}</span>
        </button>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/png,image/jpeg"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
