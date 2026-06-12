import * as React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Paperclip, UploadCloud, X } from 'lucide-react';
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
import { Label } from '@/components/ui/label';
import { ro } from '@/i18n/ro';

import { uploadDocument } from '@/features/patients/data';
import {
  patientQueryKey,
  patientTimelineQueryKey,
} from '@/features/patients/query-key';

const f = ro.patients.docForm;
const ACCEPT = '.pdf,.doc,.docx';

export function DocumentUploadSheet({
  patientId,
  open,
  onOpenChange,
}: {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const [title, setTitle] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setTitle('');
      setFile(null);
    }
  }, [open]);

  const mutation = useMutation({
    mutationFn: () => uploadDocument(patientId, file!, title),
    onSuccess: () => {
      toast.success(ro.patients.toast.documentUploaded);
      queryClient.invalidateQueries({
        queryKey: patientTimelineQueryKey(patientId),
      });
      queryClient.invalidateQueries({ queryKey: patientQueryKey(patientId) });
      onOpenChange(false);
    },
    onError: () => toast.error(ro.patients.toast.error),
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error(f.noFile);
      return;
    }
    mutation.mutate();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-card text-card-foreground sm:max-w-md"
      >
        <SheetHeader className="border-b px-6 py-4">
          <SheetTitle>{f.title}</SheetTitle>
          <SheetDescription>{f.subtitle}</SheetDescription>
        </SheetHeader>

        <form onSubmit={submit} className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="doc-title">{f.titleLabel}</Label>
              <Input
                id="doc-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={f.titlePlaceholder}
              />
            </div>

            <div className="space-y-2">
              <Label>{f.file}</Label>
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              {file ? (
                <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2.5 text-sm">
                  <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="rounded p-0.5 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={ro.common.delete}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 px-4 py-8 text-sm text-muted-foreground outline-none transition-colors hover:border-ring hover:bg-muted/40 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40"
                >
                  <UploadCloud className="size-6" strokeWidth={1.75} />
                  <span className="font-medium text-foreground">{f.choose}</span>
                  <span className="text-xs">PDF, DOC, DOCX</span>
                </button>
              )}
            </div>
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
            <Button type="submit" disabled={mutation.isPending || !file}>
              {mutation.isPending && <Loader2 className="animate-spin" />}
              {mutation.isPending ? f.saving : f.save}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
