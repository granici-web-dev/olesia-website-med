import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IMAGE_MAX_BYTES,
  SITE_MEDIA_SLOTS,
  VIDEO_MAX_BYTES,
  type SiteMediaSlot,
} from '@olesia/shared';
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  RotateCcw,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import {
  fetchSiteMedia,
  resetSiteMedia,
  setSiteMedia,
  uploadSiteImage,
  uploadSiteVideo,
} from '@/features/site-media/data';
import { siteMediaQueryKey } from '@/features/site-media/query-key';
import type { SiteMediaOverride } from '@/features/site-media/types';

const t = ro.siteMedia;

const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const VIDEO_EXT = ['.mp4', '.webm'];

const dateFmt = new Intl.DateTimeFormat('ro-RO', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** The public site's origin, so previews can resolve the committed fallbacks. */
const SITE_ORIGIN = import.meta.env.VITE_SITE_URL ?? 'http://localhost:3000';

function previewUrl(url: string): string {
  return url.startsWith('/') ? `${SITE_ORIGIN}${url}` : url;
}

/** Slots grouped by the page they appear on, in catalogue order. */
const GROUPS = SITE_MEDIA_SLOTS.reduce<
  { page: string; slots: SiteMediaSlot[] }[]
>((acc, slot) => {
  const group = acc.find((g) => g.page === slot.page);
  if (group) group.slots.push(slot);
  else acc.push({ page: slot.page, slots: [slot] });
  return acc;
}, []);

export function SiteMediaPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: siteMediaQueryKey,
    queryFn: fetchSiteMedia,
  });

  const overrides = React.useMemo(
    () => new Map((data ?? []).map((o) => [o.key, o])),
    [data],
  );

  const [busyKey, setBusyKey] = React.useState<string | null>(null);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: siteMediaQueryKey });

  const resetMutation = useMutation({
    mutationFn: (key: string) => resetSiteMedia(key),
    onSuccess: () => {
      toast.success(t.toast.reset);
      invalidate();
    },
    onError: () => toast.error(t.toast.error),
  });

  const upload = async (slot: SiteMediaSlot, file: File) => {
    const isVideo = slot.kind === 'video';
    const name = file.name.toLowerCase();
    const allowed = isVideo ? VIDEO_EXT : IMAGE_EXT;
    if (!allowed.some((ext) => name.endsWith(ext))) {
      toast.error(isVideo ? t.toast.wrongTypeVideo : t.toast.wrongTypeImage);
      return;
    }
    if (file.size > (isVideo ? VIDEO_MAX_BYTES : IMAGE_MAX_BYTES)) {
      toast.error(isVideo ? t.toast.tooLargeVideo : t.toast.tooLargeImage);
      return;
    }

    setBusyKey(slot.key);
    try {
      const stored = isVideo
        ? await uploadSiteVideo(file)
        : await uploadSiteImage(file);
      await setSiteMedia(slot.key, {
        url: stored.url,
        width: stored.width,
        height: stored.height,
        fileName: stored.name,
      });
      toast.success(t.toast.updated);
      invalidate();
    } catch {
      toast.error(t.toast.error);
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw className={cn(isFetching && 'animate-spin')} />
            {t.refresh}
          </Button>
        }
      />

      <p className="flex items-start gap-2.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0" />
        {t.intro}
      </p>

      {isError ? (
        <Card className="py-0">
          <EmptyState
            icon={AlertTriangle}
            title={ro.states.errorTitle}
            description={ro.states.errorBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw />
                {ro.common.retry}
              </Button>
            }
          />
        </Card>
      ) : isLoading ? (
        <SiteMediaSkeleton />
      ) : (
        GROUPS.map((group) => (
          <section key={group.page} className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              {t.page[group.page as keyof typeof t.page] ?? group.page}
            </h2>
            {/* Three video slots is a consequence of burned-in subtitles. */}
            {group.slots.some((s) => s.kind === 'video') && (
              <p className="text-xs text-muted-foreground">{t.videoNote}</p>
            )}
            <div className="space-y-3">
              {group.slots.map((slot) => (
                <SlotCard
                  key={slot.key}
                  slot={slot}
                  override={overrides.get(slot.key)}
                  busy={busyKey === slot.key}
                  disabled={busyKey !== null || resetMutation.isPending}
                  onUpload={(file) => upload(slot, file)}
                  onReset={() => resetMutation.mutate(slot.key)}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function SlotCard({
  slot,
  override,
  busy,
  disabled,
  onUpload,
  onReset,
}: {
  slot: SiteMediaSlot;
  override: SiteMediaOverride | undefined;
  busy: boolean;
  disabled: boolean;
  onUpload: (file: File) => void;
  onReset: () => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const isVideo = slot.kind === 'video';
  const url = previewUrl(override?.url ?? slot.fallback);

  return (
    <Card className="flex-row items-start gap-4 p-4 sm:p-5">
      <div className="aspect-[4/5] w-20 shrink-0 overflow-hidden rounded-md border bg-muted sm:w-24">
        {isVideo ? (
          // `preload="metadata"` is enough for a first frame and avoids pulling
          // 8 MB per slot into a page that lists ten of them.
          <video
            src={url}
            preload="metadata"
            muted
            playsInline
            className="size-full object-cover"
          />
        ) : (
          <img src={url} alt="" className="size-full object-cover" />
        )}
      </div>

      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">
            {t.slot[slot.key as keyof typeof t.slot] ?? slot.key}
          </p>
          {override ? (
            <Badge variant="secondary">{t.replaced}</Badge>
          ) : (
            <Badge variant="outline">{t.original}</Badge>
          )}
        </div>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 underline-offset-4 hover:text-primary hover:underline"
          >
            {override?.fileName || slot.fallback.split('/').pop()}
            <ExternalLink className="size-3" />
          </a>
          {override && (
            <>
              <span>·</span>
              <span>
                {t.replacedOn} {dateFmt.format(new Date(override.updatedAt))}
              </span>
            </>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {isVideo ? t.hint.video : t.hint.image}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="animate-spin" /> : <Upload />}
          {busy ? t.uploading : t.upload}
        </Button>
        {override && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={disabled}
            onClick={onReset}
          >
            <RotateCcw />
            {t.reset}
          </Button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={isVideo ? 'video/mp4,video/webm' : 'image/jpeg,image/png,image/webp'}
          className="hidden"
          onChange={(ev) => {
            const file = ev.target.files?.[0];
            ev.target.value = '';
            if (file) onUpload(file);
          }}
        />
      </div>
    </Card>
  );
}

function SiteMediaSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="flex-row items-start gap-4 p-5">
          <Skeleton className="aspect-[4/5] w-24 shrink-0 rounded-md" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-64" />
            <Skeleton className="h-3 w-40" />
          </div>
          <Skeleton className="h-8 w-32 shrink-0" />
        </Card>
      ))}
    </div>
  );
}
