import { ShieldAlert } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { ro } from '@/i18n/ro';

/** Shown when an authenticated user lacks the role for a section. */
export function Forbidden() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <EmptyState
        icon={ShieldAlert}
        title={ro.states.forbiddenTitle}
        description={ro.states.forbiddenBody}
      />
    </div>
  );
}
