import * as React from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { ro } from '@/i18n/ro';

/**
 * Confirmation in front of an action that cannot be undone.
 *
 * The dialog stays up while the action runs and comes down when it settles,
 * either way: closing it on the click would leave the operator looking at a
 * page that has not changed yet, and a second press on a destructive button is
 * exactly what this component exists to prevent. Failure is reported by the
 * caller's toast, as everywhere else in the panel.
 */
export function ConfirmAction({
  trigger,
  title,
  body,
  cta,
  onConfirm,
  pending,
  destructive,
}: {
  trigger: React.ReactNode;
  title: string;
  body: string;
  cta: string;
  onConfirm: () => void;
  pending: boolean;
  destructive?: boolean;
}) {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!pending) setOpen(false);
  }, [pending]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{body}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>
            {ro.common.cancel}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={pending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className={cn(
              destructive &&
                'bg-destructive text-destructive-foreground hover:bg-destructive/90',
            )}
          >
            {cta}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
