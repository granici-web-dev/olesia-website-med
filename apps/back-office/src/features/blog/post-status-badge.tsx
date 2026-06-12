import { Badge } from '@/components/ui/badge';
import { ro } from '@/i18n/ro';
import type { PostStatus } from '@/features/blog/types';

export function PostStatusBadge({ status }: { status: PostStatus }) {
  return (
    <Badge variant={status === 'published' ? 'success' : 'muted'}>
      {ro.blog.status[status]}
    </Badge>
  );
}
