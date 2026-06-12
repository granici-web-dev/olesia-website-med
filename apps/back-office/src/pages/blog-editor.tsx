import * as React from 'react';
import { useForm, Controller, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import { MarkdownEditor } from '@/components/markdown/markdown-editor';
import { CoverImageField } from '@/features/blog/cover-image-field';
import { CategoryPicker } from '@/features/blog/category-picker';
import { PostStatusBadge } from '@/features/blog/post-status-badge';
import {
  fetchPost,
  fetchCategories,
  createPost,
  updatePost,
  slugify,
  formatDate,
} from '@/features/blog/data';
import {
  postsQueryKey,
  categoriesQueryKey,
  postQueryKey,
} from '@/features/blog/query-keys';
import type { Post, PostInput, PostStatus } from '@/features/blog/types';
import { paths } from '@/config/routes';

const e = ro.blog.editor;

const schema = z.object({
  slug: z.string().trim().min(1, e.required),
  titleRo: z.string().trim().min(1, e.missingTitle),
  titleEn: z.string(),
  excerptRo: z.string(),
  excerptEn: z.string(),
  contentRo: z.string(),
  contentEn: z.string(),
  coverImageUrl: z.string().nullable(),
  categoryIds: z.array(z.string()),
});

type FormValues = z.infer<typeof schema>;

const EMPTY: FormValues = {
  slug: '',
  titleRo: '',
  titleEn: '',
  excerptRo: '',
  excerptEn: '',
  contentRo: '',
  contentEn: '',
  coverImageUrl: null,
  categoryIds: [],
};

function fromPost(p: Post): FormValues {
  return {
    slug: p.slug,
    titleRo: p.titleRo,
    titleEn: p.titleEn,
    excerptRo: p.excerptRo,
    excerptEn: p.excerptEn,
    contentRo: p.contentRo,
    contentEn: p.contentEn,
    coverImageUrl: p.coverImageUrl,
    categoryIds: p.categoryIds,
  };
}

export function BlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const postQuery = useQuery({
    queryKey: id ? postQueryKey(id) : ['blog', 'post', 'new'],
    queryFn: () => fetchPost(id as string),
    enabled: isEdit,
  });
  const { data: categories } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
  });

  const post = postQuery.data;

  const [lang, setLang] = React.useState<'ro' | 'en'>('ro');
  const slugEdited = React.useRef(isEdit);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  // Hydrate the form once the post arrives (edit mode).
  React.useEffect(() => {
    if (post) {
      slugEdited.current = true;
      form.reset(fromPost(post));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  // Auto-derive slug from the RO title until the user edits it manually.
  const titleRo = form.watch('titleRo');
  React.useEffect(() => {
    if (!slugEdited.current) {
      form.setValue('slug', slugify(titleRo || ''));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleRo]);

  const mutation = useMutation({
    mutationFn: ({
      values,
      status,
    }: {
      values: FormValues;
      status: PostStatus;
    }) => {
      const publishedAt =
        status === 'published'
          ? (post?.publishedAt ?? new Date().toISOString())
          : null;
      const input: PostInput = {
        slug: values.slug.trim() || slugify(values.titleRo),
        titleRo: values.titleRo.trim(),
        titleEn: values.titleEn.trim(),
        excerptRo: values.excerptRo.trim(),
        excerptEn: values.excerptEn.trim(),
        contentRo: values.contentRo,
        contentEn: values.contentEn,
        coverImageUrl: values.coverImageUrl,
        status,
        publishedAt,
        categoryIds: values.categoryIds,
      };
      return isEdit ? updatePost(id as string, input) : createPost(input);
    },
    onSuccess: (_data, { status }) => {
      const wasDraft = post?.status !== 'published';
      toast.success(
        status === 'published' && wasDraft
          ? ro.blog.toast.published
          : isEdit
            ? ro.blog.toast.updated
            : ro.blog.toast.created,
      );
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
      navigate(paths.blog);
    },
    onError: () => toast.error(ro.blog.toast.error),
  });

  const save = (status: PostStatus) =>
    form.handleSubmit(
      (values) => mutation.mutate({ values, status }),
      () => {
        setLang('ro');
        toast.error(e.missingTitle);
      },
    )();

  const errors = form.formState.errors;
  const busy = mutation.isPending;

  if (isEdit && postQuery.isLoading) {
    return <EditorSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1.5">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 h-7 text-muted-foreground"
          >
            <Link to={paths.blog}>
              <ArrowLeft />
              {e.backToList}
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">
              {isEdit ? e.editTitle : e.newTitle}
            </h1>
            {post && <PostStatusBadge status={post.status} />}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => save('draft')}
            disabled={busy}
          >
            {busy && <Loader2 className="animate-spin" />}
            {e.saveDraft}
          </Button>
          <Button onClick={() => save('published')} disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {post?.status === 'published' ? e.saveChanges : e.publish}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main content */}
        <Card className="gap-5 p-6">
          {/* Language switch */}
          <div className="inline-flex w-fit rounded-lg bg-muted p-1">
            {(['ro', 'en'] as const).map((l) => {
              const hasError = l === 'ro' && !!errors.titleRo;
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
                  {l === 'ro' ? e.langRo : e.langEn}
                  {hasError && (
                    <span className="size-1.5 rounded-full bg-destructive" />
                  )}
                </button>
              );
            })}
          </div>

          <LangFields lang="ro" hidden={lang !== 'ro'} form={form} />
          <LangFields lang="en" hidden={lang !== 'en'} form={form} />
        </Card>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="gap-4 p-5">
            <p className="text-sm font-semibold">{e.settings}</p>

            <div className="space-y-2">
              <Label htmlFor="slug">{e.slug}</Label>
              <Input
                id="slug"
                aria-invalid={!!errors.slug}
                {...form.register('slug', {
                  onChange: () => {
                    slugEdited.current = true;
                  },
                })}
              />
              {errors.slug ? (
                <p className="text-xs font-medium text-destructive">
                  {errors.slug.message}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">{e.slugHint}</p>
              )}
            </div>

            {post?.publishedAt && (
              <div className="space-y-1">
                <Label>{e.publishedAt}</Label>
                <p className="text-sm text-muted-foreground">
                  {formatDate(post.publishedAt)}
                </p>
              </div>
            )}
          </Card>

          <Card className="gap-3 p-5">
            <p className="text-sm font-semibold">{e.cover}</p>
            <Controller
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <CoverImageField
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Card>

          <Card className="gap-3 p-5">
            <p className="text-sm font-semibold">{e.categories}</p>
            <Controller
              control={form.control}
              name="categoryIds"
              render={({ field }) => (
                <CategoryPicker
                  categories={categories ?? []}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

function LangFields({
  lang,
  hidden,
  form,
}: {
  lang: 'ro' | 'en';
  hidden: boolean;
  form: UseFormReturn<FormValues>;
}) {
  const cap = lang === 'ro' ? 'Ro' : 'En';
  const titleKey = `title${cap}` as 'titleRo' | 'titleEn';
  const excerptKey = `excerpt${cap}` as 'excerptRo' | 'excerptEn';
  const contentKey = `content${cap}` as 'contentRo' | 'contentEn';
  const titleError = lang === 'ro' ? form.formState.errors.titleRo : undefined;

  return (
    <div className={cn('space-y-4', hidden && 'hidden')}>
      <div className="space-y-2">
        <Label htmlFor={titleKey}>{e.titleField}</Label>
        <Input
          id={titleKey}
          placeholder={e.titlePlaceholder}
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
        <Label htmlFor={excerptKey}>{e.excerpt}</Label>
        <Textarea
          id={excerptKey}
          rows={2}
          placeholder={e.excerptPlaceholder}
          {...form.register(excerptKey)}
        />
      </div>

      <div className="space-y-2">
        <Label>{e.content}</Label>
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

function EditorSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="gap-4 p-6">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-80 w-full" />
        </Card>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
