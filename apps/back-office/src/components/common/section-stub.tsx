import type { LucideIcon } from 'lucide-react';
import { Hammer } from 'lucide-react';

import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ro } from '@/i18n/ro';

/**
 * Styled placeholder for sections whose data layer isn't wired yet.
 * Real, on-brand "coming soon" state — not a bare route.
 */
export function SectionStub({
  title,
  subtitle,
  icon = Hammer,
  primaryAction,
}: {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  /** Label of the section's eventual primary action, shown disabled as a preview. */
  primaryAction?: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader
        title={title}
        subtitle={subtitle}
        actions={
          primaryAction ? (
            <Button disabled aria-disabled>
              {primaryAction}
            </Button>
          ) : undefined
        }
      />
      <Card className="py-0">
        <EmptyState
          icon={icon}
          title={ro.states.comingSoonTitle}
          description={ro.states.comingSoonBody}
        />
      </Card>
    </div>
  );
}
