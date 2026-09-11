import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Download, ImagePlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { TextField, TextAreaField } from '@/components/common/form-fields';
import { LocaleTabsList } from '@/components/common/locale-tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { IMAGE_MAX_BYTES } from '@olesia/shared';
import { ro } from '@/i18n/ro';

import {
  createMedia,
  updateMedia,
  fetchThumbnail,
  uploadThumbnail,
} from '@/features/media/api';
import { parsePublicationUrl } from '@/features/media/parse-url';
import { mediaQueryKey } from '@/features/media/query-key';
import {
  MEDIA_KINDS,
  type MediaAppearance,
  type MediaAppearanceInput,
  type MediaKind,
} from '@/features/media/types';

const t = ro.media;
const f = t.form;

const schema = z.object({
  url: z
    .string()
    .trim()
    .min(1, f.required)
    .refine((v) => parsePublicationUrl(v) !== null, f.urlInvalid),
  embedRef: z.string().trim().min(1, f.required),
  kind: z.enum(MEDIA_KINDS),
  outlet: z.string().trim().min(1, f.required),
  show: z.string(),
  /** `<input type="date">` gives `yyyy-mm-dd` or an empty string. */
  date: z.string(),
  duration: z.string(),
  titleRo: z.string().trim().min(1, f.required),
  titleEn: z.string().trim().min(1, f.required),
  titleRu: z.string(),
  summaryRo: z.string().trim().min(1, f.required),
  summaryEn: z.string().trim().min(1, f.required),
  summaryRu: z.string(),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  url: '',
  embedRef: '',
  kind: 'tv',
  outlet: '',
  show: '',
  date: '',
  duration: '',
  titleRo: '',
  titleEn: '',
  titleRu: '',
  summaryRo: '',
  summaryEn: '',
  summaryRu: '',
  active: true,
};

function fromMedia(m: MediaAppearance): FormValues {
  return {
    url: m.url,
    embedRef: m.embedRef,
    kind: m.kind,
    outlet: m.outlet,
    show: m.show ?? '',
    date: m.date ? m.date.slice(0, 10) : '',
    duration: m.duration ?? '',
    titleRo: m.titleRo,
    titleEn: m.titleEn,
    titleRu: m.titleRu ?? '',
    summaryRo: m.summaryRo,
    summaryEn: m.summaryEn,
    summaryRu: m.summaryRu ?? '',
    active: m.active,
  };
}

export function MediaFormSheet({
  item,
  open,
  onOpenChange,
}: {
  /** Editing an existing appearance, or null to add one. */
  item: MediaAppearance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = item !== null;
  const queryClient = useQueryClient();
  const fileRef = React.useRef<HTMLInputElement>(null);

  /** The thumbnail lives outside the form: it is a stored file, not a field. */
  const [thumb, setThumb] = React.useState<{
    url: string;
    width: number;
    height: number;
  } | null>(null);
  const [thumbBusy, setThumbBusy] = React.useState<'fetch' | 'upload' | null>(
    null,
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(item ? fromMedia(item) : EMPTY);
    setThumb(
      item
        ? {
            url: item.thumbUrl,
            width: item.thumbWidth,
            height: item.thumbHeight,
          }
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  const url = form.watch('url');
  const parsed = parsePublicationUrl(url);
  const provider = parsed?.provider ?? null;

  // Typing a link fills in the embed reference; YouTube always resolves, a
  // Facebook /watch link cannot and is left for her to paste.
  React.useEffect(() => {
    if (!parsed) return;
    if (parsed.ref && parsed.ref !== form.getValues('embedRef')) {
      form.setValue('embedRef', parsed.ref, { shouldValidate: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.provider, parsed?.ref]);

  const grabThumbnail = async () => {
    setThumbBusy('fetch');
    try {
      setThumb(await fetchThumbnail(url));
      toast.success(t.toast.thumbFetched);
    } catch {
      toast.error(t.toast.thumbFetchFailed);
    } finally {
      setThumbBusy(null);
    }
  };

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const file = ev.target.files?.[0];
    ev.target.value = '';
    if (!file) return;
    if (file.size > IMAGE_MAX_BYTES) {
      toast.error(t.toast.thumbTooLarge);
      return;
    }
    setThumbBusy('upload');
    try {
      setThumb(await uploadThumbnail(file));
      toast.success(t.toast.thumbUploaded);
    } catch {
      toast.error(t.toast.error);
    } finally {
      setThumbBusy(null);
    }
  };

  const toInput = (values: FormValues): MediaAppearanceInput => {
    const orNull = (v: string) => v.trim() || null;
    return {
      kind: values.kind as MediaKind,
      outlet: values.outlet.trim(),
      show: orNull(values.show),
      // A bare `yyyy-mm-dd` parses as UTC midnight, which is what we store.
      date: values.date ? new Date(values.date).toISOString() : null,
      duration: orNull(values.duration),
      titleRo: values.titleRo.trim(),
      titleEn: values.titleEn.trim(),
      titleRu: orNull(values.titleRu),
      summaryRo: values.summaryRo.trim(),
      summaryEn: values.summaryEn.trim(),
      summaryRu: orNull(values.summaryRu),
      url: values.url.trim(),
      embedProvider: parsePublicationUrl(values.url)?.provider ?? 'youtube',
      embedRef: values.embedRef.trim(),
      thumbUrl: thumb?.url ?? '',
      thumbWidth: thumb?.width ?? 0,
      thumbHeight: thumb?.height ?? 0,
      active: values.active,
    };
  };

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateMedia(item.id, toInput(values))
        : createMedia(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? t.toast.updated : t.toast.created);
      queryClient.invalidateQueries({ queryKey: mediaQueryKey });
      onOpenChange(false);
    },
    onError: () => toast.error(t.toast.error),
  });

  const submit = form.handleSubmit(
    (values) => {
      // The thumbnail is required but is not a form field, so it is checked here.
      if (!thumb) {
        toast.error(f.thumbMissing);
        return;
      }
      mutation.mutate(values);
    },
    () => toast.error(f.missingRequired),
  );

  const errors = form.formState.errors;
  const roHasError = !!(errors.titleRo || errors.summaryRo);
  const enHasError = !!(errors.titleEn || errors.summaryEn);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-xl"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{isEdit ? f.editTitle : f.createTitle}</SheetTitle>
          <SheetDescription>
            {isEdit ? f.editSubtitle : f.createSubtitle}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <TextField
              id="md-url"
              label={f.url}
              placeholder={f.urlPlaceholder}
              error={errors.url?.message}
              hint={f.urlHint}
              {...form.register('url')}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>{f.provider}</Label>
                <div className="flex h-9 items-center">
                  <code className="rounded bg-muted px-2 py-1 text-xs font-medium">
                    {provider ? t.provider[provider] : ro.common.none}
                  </code>
                </div>
              </div>
              <TextField
                id="md-ref"
                label={f.embedRef}
                error={errors.embedRef?.message}
                hint={
                  provider === 'facebook'
                    ? f.embedRefHintFacebook
                    : f.embedRefHintYoutube
                }
                {...form.register('embedRef')}
              />
            </div>

            <Separator />

            {/* Thumbnail — a stored file, so it lives beside the form fields. */}
            <div className="space-y-2">
              <Label>{f.thumb}</Label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="aspect-video w-full shrink-0 overflow-hidden rounded-lg border bg-muted sm:w-48">
                  {thumb ? (
                    <img
                      src={thumb.url}
                      alt=""
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-muted-foreground">
                      <ImagePlus className="size-6" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={provider !== 'youtube' || thumbBusy !== null}
                      onClick={grabThumbnail}
                    >
                      {thumbBusy === 'fetch' ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <Download />
                      )}
                      {thumbBusy === 'fetch' ? f.thumbFetching : f.thumbFetch}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={thumbBusy !== null}
                      onClick={() => fileRef.current?.click()}
                    >
                      {thumbBusy === 'upload' ? (
                        <Loader2 className="animate-spin" />
                      ) : (
                        <ImagePlus />
                      )}
                      {thumbBusy === 'upload'
                        ? f.thumbUploading
                        : f.thumbUpload}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">{f.thumbHint}</p>
                </div>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={onPickFile}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="md-kind">{f.kind}</Label>
                <Controller
                  control={form.control}
                  name="kind"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="md-kind" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MEDIA_KINDS.map((k) => (
                          <SelectItem key={k} value={k}>
                            {t.kind[k]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <TextField
                id="md-outlet"
                label={f.outlet}
                placeholder={f.outletPlaceholder}
                error={errors.outlet?.message}
                {...form.register('outlet')}
              />
              <TextField
                id="md-show"
                label={f.show}
                placeholder={f.showPlaceholder}
                {...form.register('show')}
              />
              <TextField
                id="md-duration"
                label={f.duration}
                placeholder={f.durationPlaceholder}
                {...form.register('duration')}
              />
              <div className="sm:col-span-2">
                <TextField
                  id="md-date"
                  type="date"
                  label={f.date}
                  hint={f.dateHint}
                  {...form.register('date')}
                />
              </div>
            </div>

            <Separator />

            <Tabs defaultValue="ro">
              <LocaleTabsList roHasError={roHasError} enHasError={enHasError} />

              <TabsContent value="ro" className="mt-4 space-y-4">
                <TextField
                  id="md-title-ro"
                  label={f.title}
                  placeholder={f.titlePlaceholderRo}
                  error={errors.titleRo?.message}
                  {...form.register('titleRo')}
                />
                <TextAreaField
                  rows={4}
                  id="md-summary-ro"
                  label={f.summary}
                  placeholder={f.summaryPlaceholderRo}
                  error={errors.summaryRo?.message}
                  {...form.register('summaryRo')}
                />
              </TabsContent>

              <TabsContent value="en" className="mt-4 space-y-4">
                <TextField
                  id="md-title-en"
                  label={f.title}
                  placeholder={f.titlePlaceholderEn}
                  error={errors.titleEn?.message}
                  {...form.register('titleEn')}
                />
                <TextAreaField
                  rows={4}
                  id="md-summary-en"
                  label={f.summary}
                  placeholder={f.summaryPlaceholderEn}
                  error={errors.summaryEn?.message}
                  {...form.register('summaryEn')}
                />
              </TabsContent>

              <TabsContent value="ru" className="mt-4 space-y-4">
                <TextField
                  id="md-title-ru"
                  label={f.title}
                  placeholder={f.titlePlaceholderRu}
                  hint={ro.common.ruFallbackHint}
                  {...form.register('titleRu')}
                />
                <TextAreaField
                  rows={4}
                  id="md-summary-ru"
                  label={f.summary}
                  placeholder={f.summaryPlaceholderRu}
                  {...form.register('summaryRu')}
                />
              </TabsContent>
            </Tabs>

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="md-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="md-active"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </div>
              )}
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              {ro.common.cancel}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? f.saving : f.save}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
