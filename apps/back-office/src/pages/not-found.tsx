import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { paths } from '@/config/routes';
import { ro } from '@/i18n/ro';

export function NotFoundPage() {
  return (
    <div className="grid min-h-[60vh] place-items-center">
      <EmptyState
        icon={Compass}
        title={ro.states.notFoundTitle}
        description={ro.states.notFoundBody}
        action={
          <Button asChild>
            <Link to={paths.dashboard}>{ro.states.notFoundCta}</Link>
          </Button>
        }
      />
    </div>
  );
}
