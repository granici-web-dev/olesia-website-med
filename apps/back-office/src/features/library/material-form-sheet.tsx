import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Upload, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ApiError } from '@/api/http';
import { ro } from '@/i18n/ro';

import {
  createMaterial,
  updateMaterial,
  uploadMaterialFile,
  uploadPrivateMaterialFile,
} from '@/features/library/data';
import { materialsQueryKey } from '@/features/library/query-key';
import {
  AGE_KEYS,
  MATERIAL_ACCESS,
  MATERIAL_FLAGS,
  type Material,
  type MaterialCategory,
  type MaterialInput,
} from '@/features/library/types';

const t = ro.library;
const f = t.form;

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const ALLOWED_EXT = ['.pdf', '.doc', '.docx'];

const optionalInt = z
  .string()
  .refine((v) => v === '' || /^\d+$/.test(v), f.required);

const schema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, f.required)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, f.slugInvalid),
  categoryId: z.string().min(1, f.required),
  ageKeys: z.array(z.string()),
  titleRo: z.string().trim().min(1, f.required),
  titleEn: z.string().trim().min(1, f.required),
  titleRu: z.string(),
  descriptionRo: z.string().trim().min(1, f.required),
  descriptionEn: z.string().trim().min(1, f.required),
  descriptionRu: z.string(),
  pageCount: optionalInt,
  fileLang: z.string(),
  access: z.enum(MATERIAL_ACCESS),
  price: optionalInt,
  flags: z.array(z.string()),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function emptyValues(categoryId: string): FormValues {
  return {
    slug: '',
    categoryId,
    ageKeys: [],
    titleRo: '',
    titleEn: '',
    titleRu: '',
    descriptionRo: '',
    descriptionEn: '',
    descriptionRu: '',
    pageCount: '',
    fileLang: 'RO',
    access: 'free',
    price: '',
    flags: [],
    active: true,
  };
}

function fromMaterial(m: Material): FormValues {
  return {
    slug: m.slug,
    categoryId: m.categoryId,
    ageKeys: [...m.ageKeys],
    titleRo: m.titleRo,
    titleEn: m.titleEn,
    titleRu: m.titleRu ?? '',
    descriptionRo: m.descriptionRo,
    descriptionEn: m.descriptionEn,
    descriptionRu: m.descriptionRu ?? '',
    pageCount: m.pageCount === null ? '' : String(m.pageCount),
    fileLang: m.fileLang ?? '',
    access: m.access,
    price: m.price === null ? '' : String(m.price),
    flags: [...m.flags],
    active: m.active,
  };
}

export function MaterialFormSheet({
  material,
  categories,
  open,
  onOpenChange,
}: {
  /** Editing an existing material, or null to add one. */
  material: Material | null;
  categories: MaterialCategory[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const isEdit = material !== null;
  const queryClient = useQueryClient();
  const fileRef = React.useRef<HTMLInputElement>(null);

  /**
   * The file is stored, not a form field — it is uploaded before the save.
   *
   * `url` for a free material, `key` for a paid one, never both: the two live
   * in different directories, and which one a file went to is decided by the
   * endpoint that took it rather than by a column somebody sets afterwards.
   */
  const [file, setFile] = React.useState<{
    url: string | null;
    key: string | null;
    name: string;
  } | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues(categories[0]?.id ?? ''),
  });

  React.useEffect(() => {
    if (!open) return;
    form.reset(
      material
        ? fromMaterial(material)
        : emptyValues(categories[0]?.id ?? ''),
    );
    setFile(
      material?.fileUrl || material?.fileKey
        ? {
            url: material.fileUrl,
            key: material.fileKey,
            name: material.fileName ?? '',
          }
        : null,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, material]);

  const access = form.watch('access');
  const isPaid = access === 'paid';

  /**
   * Changing `access` drops the file.
   *
   * The two stores are separate volumes in `docker-compose.prod.yml`, so
   * moving the bytes would be a copy plus an unlink that can half-fail — and
   * the API refuses to keep a file across the switch for the same reason. The
   * sheet does it here as well, visibly, so the editor finds out while she is
   * looking at the form rather than after saving. The storefront already
   * renders a material with no file honestly, as "în curând".
   */
  const previousAccess = React.useRef(access);
  React.useEffect(() => {
    if (previousAccess.current === access) return;
    previousAccess.current = access;
    if (file) {
      setFile(null);
      toast.info(t.toast.fileClearedOnAccessChange);
    }
  }, [access, file]);

  const onPickFile: React.ChangeEventHandler<HTMLInputElement> = async (ev) => {
    const picked = ev.target.files?.[0];
    ev.target.value = '';
    if (!picked) return;
    if (picked.size > MAX_FILE_BYTES) {
      toast.error(t.toast.fileTooLarge);
      return;
    }
    const name = picked.name.toLowerCase();
    if (!ALLOWED_EXT.some((ext) => name.endsWith(ext))) {
      toast.error(t.toast.fileType);
      return;
    }
    setUploading(true);
    try {
      // Which endpoint decides which directory the bytes land in, and there is
      // no later step that can move them. A paid PDF on the public route is
      // the failure this whole step exists to close.
      const stored = isPaid
        ? await uploadPrivateMaterialFile(picked)
        : await uploadMaterialFile(picked);
      setFile({
        url: stored.url ?? null,
        key: stored.key ?? null,
        name: stored.name,
      });
      toast.success(t.toast.fileUploaded);
    } catch {
      toast.error(t.toast.error);
    } finally {
      setUploading(false);
    }
  };

  const toInput = (values: FormValues): MaterialInput => ({
    slug: values.slug.trim(),
    categoryId: values.categoryId,
    ageKeys: values.ageKeys,
    titleRo: values.titleRo.trim(),
    titleEn: values.titleEn.trim(),
    titleRu: values.titleRu.trim() || null,
    descriptionRo: values.descriptionRo.trim(),
    descriptionEn: values.descriptionEn.trim(),
    descriptionRu: values.descriptionRu.trim() || null,
    pageCount: values.pageCount ? Number(values.pageCount) : null,
    fileLang: values.fileLang.trim() || null,
    access: values.access,
    // A price on a free material would be dead data waiting to surprise us.
    price:
      values.access === 'paid' && values.price ? Number(values.price) : null,
    flags: values.flags as Material['flags'],
    fileUrl: file?.url ?? null,
    fileKey: file?.key ?? null,
    fileName: file?.name ?? null,
    active: values.active,
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      isEdit
        ? updateMaterial(material.id, toInput(values))
        : createMaterial(toInput(values)),
    onSuccess: () => {
      toast.success(isEdit ? t.toast.updated : t.toast.created);
      queryClient.invalidateQueries({ queryKey: materialsQueryKey });
      onOpenChange(false);
    },
    onError: (err) => {
      // The slug is unique server-side; say which field is at fault.
      if (err instanceof ApiError && err.status === 409) {
        form.setError('slug', { message: f.slugTaken });
        toast.error(f.slugTaken);
        return;
      }
      toast.error(t.toast.error);
    },
  });

  const errors = form.formState.errors;
  const roHasError = !!(errors.titleRo || errors.descriptionRo);
  const enHasError = !!(errors.titleEn || errors.descriptionEn);

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

        <form
          onSubmit={form.handleSubmit(
            (v) => mutation.mutate(v),
            () => toast.error(f.missingRequired),
          )}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <TextField
              id="lib-slug"
              label={f.slug}
              placeholder={f.slugPlaceholder}
              error={errors.slug?.message}
              hint={f.slugHint}
              {...form.register('slug')}
            />

            <div className="space-y-2">
              <Label htmlFor="lib-category">{f.category}</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="lib-category" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.nameRo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <Controller
              control={form.control}
              name="ageKeys"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>{f.ages}</Label>
                  <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                    {AGE_KEYS.map((key) => (
                      <label
                        key={key}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value.includes(key)}
                          onCheckedChange={(on) =>
                            field.onChange(
                              on
                                ? [...field.value, key]
                                : field.value.filter((k) => k !== key),
                            )
                          }
                        />
                        {ro.ages[key]}
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">{f.agesHint}</p>
                </div>
              )}
            />

            <Separator />

            <Tabs defaultValue="ro">
              <TabsList>
                <TabsTrigger value="ro" className="gap-1.5">
                  {t.langRo}
                  {roHasError && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </TabsTrigger>
                <TabsTrigger value="en" className="gap-1.5">
                  {t.langEn}
                  {enHasError && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </TabsTrigger>
                {/* RU carries no error dot — none of its fields can fail. */}
                <TabsTrigger value="ru">{t.langRu}</TabsTrigger>
              </TabsList>

              <TabsContent value="ro" className="mt-4 space-y-4">
                <TextField
                  id="lib-title-ro"
                  label={f.title}
                  placeholder={f.titlePlaceholderRo}
                  error={errors.titleRo?.message}
                  {...form.register('titleRo')}
                />
                <TextAreaField
                  id="lib-desc-ro"
                  label={f.description}
                  placeholder={f.descriptionPlaceholderRo}
                  error={errors.descriptionRo?.message}
                  {...form.register('descriptionRo')}
                />
              </TabsContent>

              <TabsContent value="en" className="mt-4 space-y-4">
                <TextField
                  id="lib-title-en"
                  label={f.title}
                  placeholder={f.titlePlaceholderEn}
                  error={errors.titleEn?.message}
                  {...form.register('titleEn')}
                />
                <TextAreaField
                  id="lib-desc-en"
                  label={f.description}
                  placeholder={f.descriptionPlaceholderEn}
                  error={errors.descriptionEn?.message}
                  {...form.register('descriptionEn')}
                />
              </TabsContent>

              <TabsContent value="ru" className="mt-4 space-y-4">
                <TextField
                  id="lib-title-ru"
                  label={f.title}
                  placeholder={f.titlePlaceholderRu}
                  hint={ro.common.ruFallbackHint}
                  {...form.register('titleRu')}
                />
                <TextAreaField
                  id="lib-desc-ru"
                  label={f.description}
                  placeholder={f.descriptionPlaceholderRu}
                  {...form.register('descriptionRu')}
                />
              </TabsContent>
            </Tabs>

            <Separator />

            {/* File — a stored upload, so it sits outside the form fields. */}
            <div className="space-y-2">
              <Label>{f.file}</Label>
              {file ? (
                <div className="flex items-center gap-3 rounded-lg border bg-muted/40 px-3 py-2.5">
                  <FileText className="size-4 shrink-0 text-muted-foreground" />
                  {/* A paid file has no URL to open — it is in private storage
                      and comes out only through a buyer's download grant. So
                      the name is text rather than a dead link. */}
                  {file.url ? (
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="min-w-0 flex-1 truncate text-sm underline-offset-4 hover:text-primary hover:underline"
                    >
                      {file.name || file.url}
                    </a>
                  ) : (
                    <span className="min-w-0 flex-1 truncate text-sm">
                      {file.name || f.filePrivate}
                    </span>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => fileRef.current?.click()}
                  >
                    {f.fileReplace}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    aria-label={f.fileRemove}
                    onClick={() => setFile(null)}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <Upload />
                  )}
                  {uploading ? f.fileUploading : f.fileUpload}
                </Button>
              )}
              <p className="text-xs text-muted-foreground">
                {isPaid ? f.filePaidHint : f.fileHint}
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={onPickFile}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="lib-pages"
                label={f.pageCount}
                type="number"
                inputMode="numeric"
                error={errors.pageCount?.message}
                {...form.register('pageCount')}
              />
              <TextField
                id="lib-lang"
                label={f.fileLang}
                placeholder={f.fileLangPlaceholder}
                {...form.register('fileLang')}
              />
            </div>

            <Separator />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="lib-access">{f.accessField}</Label>
                <Controller
                  control={form.control}
                  name="access"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="lib-access" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MATERIAL_ACCESS.map((a) => (
                          <SelectItem key={a} value={a}>
                            {t.access[a]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {access === 'paid' && (
                <TextField
                  id="lib-price"
                  label={f.price}
                  type="number"
                  inputMode="numeric"
                  error={errors.price?.message}
                  hint={f.priceHint}
                  {...form.register('price')}
                />
              )}
            </div>

            <Controller
              control={form.control}
              name="flags"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label>{f.flags}</Label>
                  <div className="flex flex-wrap gap-x-5 gap-y-2.5">
                    {MATERIAL_FLAGS.map((flag) => (
                      <label
                        key={flag}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          checked={field.value.includes(flag)}
                          onCheckedChange={(on) =>
                            field.onChange(
                              on
                                ? [...field.value, flag]
                                : field.value.filter((x) => x !== flag),
                            )
                          }
                        />
                        {t.flag[flag]}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            />

            <Controller
              control={form.control}
              name="active"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/40 px-4 py-3">
                  <div className="space-y-0.5">
                    <Label htmlFor="lib-active" className="cursor-pointer">
                      {f.activeField}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {f.activeHint}
                    </p>
                  </div>
                  <Switch
                    id="lib-active"
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

const TextField = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & {
    label: string;
    error?: string;
    hint?: string;
  }
>(function TextField({ id, label, error, hint, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} ref={ref} aria-invalid={!!error} {...props} />
      {error ? (
        <p className="text-xs font-medium text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
});

const TextAreaField = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<'textarea'> & { label: string; error?: string }
>(function TextAreaField({ id, label, error, ...props }, ref) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} ref={ref} rows={3} aria-invalid={!!error} {...props} />
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
});
