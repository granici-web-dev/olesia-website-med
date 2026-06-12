import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Pencil,
  Plus,
  RefreshCw,
  SearchX,
  Tags,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

import { PostStatusBadge } from '@/features/blog/post-status-badge';
import { CategoriesManagerSheet } from '@/features/blog/categories-manager-sheet';
import {
  fetchPosts,
  fetchCategories,
  deletePost,
  formatDate,
} from '@/features/blog/data';
import { postsQueryKey, categoriesQueryKey } from '@/features/blog/query-keys';
import type { Post, StatusFilter } from '@/features/blog/types';
import { paths, blogEditPath } from '@/config/routes';

const t = ro.blog;
const STATUS_TABS: StatusFilter[] = ['all', 'published', 'draft'];

export function BlogPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const postsQuery = useQuery({ queryKey: postsQueryKey, queryFn: fetchPosts });
  const { data: categories } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategories,
  });

  const posts = React.useMemo(() => postsQuery.data ?? [], [postsQuery.data]);
  const categoryName = React.useMemo(() => {
    const map = new Map<string, string>();
    (categories ?? []).forEach((c) => map.set(c.id, c.nameRo));
    return map;
  }, [categories]);

  const [status, setStatus] = React.useState<StatusFilter>('all');
  const [category, setCategory] = React.useState<string>('all');
  const [search, setSearch] = React.useState('');
  const [deleting, setDeleting] = React.useState<Post | null>(null);
  const [categoriesOpen, setCategoriesOpen] = React.useState(false);

  const scoped = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== 'all' && !p.categoryIds.includes(category)) return false;
      if (q && !p.titleRo.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [posts, category, search]);

  const counts = React.useMemo(() => {
    const c: Record<StatusFilter, number> = {
      all: scoped.length,
      published: 0,
      draft: 0,
    };
    for (const p of scoped) c[p.status] += 1;
    return c;
  }, [scoped]);

  const visible = React.useMemo(
    () =>
      status === 'all' ? scoped : scoped.filter((p) => p.status === status),
    [scoped, status],
  );

  const filtersActive = status !== 'all' || category !== 'all' || search !== '';
  const resetFilters = () => {
    setStatus('all');
    setCategory('all');
    setSearch('');
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      toast.success(t.toast.deleted);
      setDeleting(null);
      queryClient.invalidateQueries({ queryKey: postsQueryKey });
    },
    onError: () => toast.error(t.toast.error),
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCategoriesOpen(true)}
            >
              <Tags />
              {t.manageCategories}
            </Button>
            <Button onClick={() => navigate(paths.blogNew)}>
              <Plus />
              {t.newPost}
            </Button>
          </>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <Tabs
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
          className="min-w-0"
        >
          <TabsList className="h-9">
            {STATUS_TABS.map((key) => (
              <TabsTrigger key={key} value={key} className="gap-1.5">
                {t.tabs[key]}
                <span className="text-xs text-muted-foreground/70 tabular-nums">
                  {counts[key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.filters.searchPlaceholder}
            aria-label={t.filters.searchPlaceholder}
            className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm shadow-xs outline-none transition-[box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 sm:w-56"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger
              className="w-auto min-w-[11rem]"
              aria-label={t.filters.allCategories}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.filters.allCategories}</SelectItem>
              {(categories ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nameRo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {filtersActive && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              {t.filters.reset}
            </Button>
          )}
        </div>
      </div>

      <Card className="overflow-hidden py-0">
        {postsQuery.isError ? (
          <EmptyState
            icon={AlertTriangle}
            title={ro.states.errorTitle}
            description={ro.states.errorBody}
            className="py-16"
            action={
              <Button variant="outline" onClick={() => postsQuery.refetch()}>
                <RefreshCw />
                {ro.common.retry}
              </Button>
            }
          />
        ) : postsQuery.isLoading ? (
          <BlogTableSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={filtersActive ? SearchX : FileText}
            title={filtersActive ? t.empty.filteredTitle : t.empty.title}
            description={filtersActive ? t.empty.filteredBody : t.empty.body}
            className="py-16"
            action={
              filtersActive ? (
                <Button variant="outline" onClick={resetFilters}>
                  {t.filters.reset}
                </Button>
              ) : (
                <Button onClick={() => navigate(paths.blogNew)}>
                  <Plus />
                  {t.newPost}
                </Button>
              )
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.columns.post}</TableHead>
                <TableHead>{t.columns.categories}</TableHead>
                <TableHead>{t.columns.status}</TableHead>
                <TableHead>{t.columns.date}</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((p) => (
                <TableRow
                  key={p.id}
                  className="cursor-pointer"
                  onClick={() => navigate(blogEditPath(p.id))}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {p.coverImageUrl ? (
                        <img
                          src={p.coverImageUrl}
                          alt=""
                          className="h-10 w-14 shrink-0 rounded-md border object-cover"
                        />
                      ) : (
                        <div className="grid h-10 w-14 shrink-0 place-items-center rounded-md border bg-muted text-muted-foreground">
                          <ImageIcon className="size-4" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div
                          className={cn(
                            'truncate font-medium',
                            !p.titleRo && 'text-muted-foreground',
                          )}
                        >
                          {p.titleRo || t.untitled}
                        </div>
                        <code className="text-xs text-muted-foreground">
                          /{p.slug}
                        </code>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {p.categoryIds.length ? (
                      <div className="flex flex-wrap gap-1">
                        {p.categoryIds.map((id) => (
                          <Badge key={id} variant="secondary">
                            {categoryName.get(id) ?? '—'}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {t.uncategorized}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    <PostStatusBadge status={p.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground tabular-nums">
                    {formatDate(p.publishedAt ?? p.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground"
                        aria-label={ro.common.edit}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(blogEditPath(p.id));
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        aria-label={ro.common.delete}
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleting(p);
                        }}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <CategoriesManagerSheet
        open={categoriesOpen}
        onOpenChange={setCategoriesOpen}
      />

      <AlertDialog
        open={deleting !== null}
        onOpenChange={(o) => !o && setDeleting(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.delete.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {deleting && (
                <>
                  <span className="font-medium text-foreground">
                    {deleting.titleRo || t.untitled}
                  </span>{' '}
                  — {t.delete.body}
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              {ro.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleting) deleteMutation.mutate(deleting.id);
              }}
            >
              {t.delete.cta}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BlogTableSkeleton() {
  return (
    <div className="divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-3 py-4">
          <Skeleton className="h-10 w-14 rounded-md" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-64" />
            <Skeleton className="h-3 w-28" />
          </div>
          <Skeleton className="h-5 w-20 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  );
}
