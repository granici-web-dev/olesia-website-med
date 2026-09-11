import * as React from 'react';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, History, Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import { ImagesField } from '@/features/about/images-field';
import { fetchAbout, updateAbout, formatDateTime } from '@/features/about/data';
import { aboutQueryKey } from '@/features/about/query-key';
import {
  aboutFormSchema,
  fromAbout,
  type AboutFormValues as FormValues,
} from '@/features/about/form-schema';
import { StatsEditor, CredentialsEditor } from '@/features/about/block-editors';

const a = ro.about;

/** The three locales of the public site; only RO is validated (see the schema). */
const LANGS = ['ro', 'en', 'ru'] as const;
type Lang = (typeof LANGS)[number];

const LANG_LABEL: Record<Lang, string> = {
  ro: a.langRo,
  en: a.langEn,
  ru: a.langRu,
};

/** Field-name suffix per locale (`titleRo`, `titleEn`, `titleRu`). */
const LANG_SUFFIX: Record<Lang, 'Ro' | 'En' | 'Ru'> = {
  ro: 'Ro',
  en: 'En',
  ru: 'Ru',
};

export function AboutPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: aboutQueryKey,
    queryFn: fetchAbout,
  });

  const [lang, setLang] = React.useState<Lang>('ro');

  const form = useForm<FormValues>({
    resolver: zodResolver(aboutFormSchema),
    defaultValues: {
      titleRo: '',
      titleEn: '',
      titleRu: '',
      contentRo: '',
      contentEn: '',
      contentRu: '',
      images: [],
      stats: [],
      credentials: [],
    },
  });

  React.useEffect(() => {
    if (data) form.reset(fromAbout(data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      updateAbout({
        titleRo: values.titleRo.trim(),
        titleEn: values.titleEn.trim(),
        titleRu: values.titleRu.trim(),
        contentRo: values.contentRo,
        contentEn: values.contentEn,
        contentRu: values.contentRu,
        images: values.images,
        stats: values.stats,
        credentials: values.credentials,
      }),
    onSuccess: () => {
      toast.success(a.toast.saved);
      queryClient.invalidateQueries({ queryKey: aboutQueryKey });
    },
    onError: () => toast.error(a.toast.error),
  });

  const save = () =>
    form.handleSubmit(
      (values) => mutation.mutate(values),
      () => {
        setLang('ro');
        toast.error(a.missingTitle);
      },
    )();

  if (isLoading) {
    return <AboutSkeleton />;
  }

  // `updateAbout` sends the whole page, so an editor opened on a failed read
  // would blank the public page on the first Salvează. No read, no editor.
  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title={a.title} subtitle={a.subtitle} />
        <Card className="py-0">
          <EmptyState
            icon={AlertTriangle}
            title={a.loadErrorTitle}
            description={a.loadErrorBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={() => refetch()}>
                <RefreshCw />
                {ro.common.retry}
              </Button>
            }
          />
        </Card>
      </div>
    );
  }

  const titleError = form.formState.errors.titleRo;

  return (
    <div className="space-y-6">
      <PageHeader
        title={a.title}
        subtitle={a.subtitle}
        actions={
          <div className="flex items-center gap-3">
            {data && (
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:inline-flex">
                <History className="size-3.5" />
                {a.lastUpdated} {formatDateTime(data.updatedAt)}
              </span>
            )}
            <Button onClick={save} disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? a.saving : a.save}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="gap-5 p-6">
          {/* Language switch */}
          <div className="inline-flex w-fit rounded-lg bg-muted p-1">
            {LANGS.map((l) => {
              const hasError = l === 'ro' && !!titleError;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    'flex h-7 items-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors',
                    lang === l
                      ? 'bg-card text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {LANG_LABEL[l]}
                  {hasError && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          {LANGS.map((l) => (
            <LangFields key={l} lang={l} hidden={lang !== l} form={form} />
          ))}
        </Card>

        <Card className="h-fit gap-3 p-5">
          <p className="text-sm font-semibold">{a.images}</p>
          <Controller
            control={form.control}
            name="images"
            render={({ field }) => (
              <ImagesField value={field.value} onChange={field.onChange} />
            )}
          />
        </Card>
      </div>

      <StatsEditor form={form} />
      <CredentialsEditor form={form} />
    </div>
  );
}

function LangFields({
  lang,
  hidden,
  form,
}: {
  lang: Lang;
  hidden: boolean;
  form: UseFormReturn<FormValues>;
}) {
  const cap = LANG_SUFFIX[lang];
  const titleKey = `title${cap}` as 'titleRo' | 'titleEn' | 'titleRu';
  const contentKey = `content${cap}` as 'contentRo' | 'contentEn' | 'contentRu';
  const titleError = lang === 'ro' ? form.formState.errors.titleRo : undefined;

  return (
    <div className={cn('space-y-4', hidden && 'hidden')}>
      <div className="space-y-2">
        <Label htmlFor={titleKey}>{a.titleField}</Label>
        <Input
          id={titleKey}
          placeholder={a.titlePlaceholder}
          aria-invalid={!!titleError}
          className="md:text-base"
          {...form.register(titleKey)}
        />
        {titleError && (
          <p className="text-xs font-medium text-destructive">
            {titleError.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{a.content}</Label>
        <Controller
          control={form.control}
          name={contentKey}
          render={({ field }) => (
            <MarkdownEditor value={field.value} onChange={field.onChange} />
          )}
        />
      </div>
    </div>
  );
}

function AboutSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="gap-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-80 w-full" />
        </Card>
        <Skeleton className="h-56 w-full rounded-xl" />
      </div>
    </div>
  );
}
