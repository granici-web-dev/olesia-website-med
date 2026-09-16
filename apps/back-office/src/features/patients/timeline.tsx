import * as React from 'react';
import { Download, Loader2, Pencil, Send, Trash2 } from 'lucide-react';

import { PaymentBadge } from '@/components/common/payment-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MarkdownPreview } from '@/components/markdown/markdown-preview';
import { ro } from '@/i18n/ro';
import { cn } from '@/lib/utils';

import {
  ConsentBadge,
  EntryTypeBadge,
  entryTypeIcon,
} from '@/features/patients/badges';
import { formatDate, formatDateTime } from '@/lib/format';
import type {
  PatientEntryDto,
  PatientInteractionDto,
} from '@/features/patients/types';

const t = ro.patients;

/* ----------------------------- entry card ----------------------------- */

export function EntryCard({
  entry,
  onEdit,
  onDelete,
  onDownload,
  onSend,
  downloading,
}: {
  entry: PatientEntryDto;
  onEdit?: (entry: PatientEntryDto) => void;
  onDelete?: (entry: PatientEntryDto) => void;
  onDownload?: (entry: PatientEntryDto) => void;
  onSend?: (entry: PatientEntryDto) => void;
  downloading?: boolean;
}) {
  const isDocument = entry.type === 'document';
  const sendable = isDocument || entry.type === 'prescription';
  const hasFile = entry.fileUrl !== null;
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <EntryTypeBadge type={entry.type} />
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDate(entry.occurredAt)}
            </span>
          </div>
          {entry.title && (
            <h4 className="font-medium text-balance">{entry.title}</h4>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {sendable && onSend && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-muted-foreground"
              aria-label={t.send.action}
              onClick={() => onSend(entry)}
            >
              <Send className="size-4" />
              <span className="hidden sm:inline">{t.send.action}</span>
            </Button>
          )}
          {hasFile && onDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-label={t.documents.download}
              disabled={downloading}
              onClick={() => onDownload(entry)}
            >
              {downloading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
            </Button>
          )}
          {!isDocument && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground"
              aria-label={ro.common.edit}
              onClick={() => onEdit(entry)}
            >
              <Pencil className="size-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground hover:text-destructive"
              aria-label={ro.common.delete}
              onClick={() => onDelete(entry)}
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {entry.body && <MarkdownPreview source={entry.body} className="mt-3" />}

      {hasFile && entry.fileName && (
        <div className="mt-3 flex items-center gap-2 rounded-md bg-muted/40 px-3 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate text-muted-foreground">
            {entry.fileName}
          </span>
        </div>
      )}

      {entry.sends.length > 0 && <SendHistory sends={entry.sends} />}
    </div>
  );
}

/** Every email this entry left in, newest first: when, to whom, by whom. */
function SendHistory({ sends }: { sends: PatientEntryDto['sends'] }) {
  return (
    <div className="mt-3 border-t pt-3">
      <p className="text-xs font-medium text-muted-foreground">
        {t.send.history}
      </p>
      <ul className="mt-1.5 space-y-1 text-xs text-muted-foreground">
        {sends.map((send) => (
          <li key={send.id} className="flex flex-wrap items-center gap-x-2">
            <Send className="size-3 shrink-0" aria-hidden />
            <span className="tabular-nums text-foreground/80">
              {formatDateTime(send.sentAt)}
            </span>
            <span className="break-all">{send.toEmail}</span>
            <span className="uppercase">{send.locale}</span>
            {send.sentByName && (
              <span>
                {t.send.sentBy} {send.sentByName}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* -------------------------- interaction item -------------------------- */

/**
 * One thing the person bought, in the dossier's timeline.
 *
 * The payment badge is read-only. It used to be a switcher that wrote
 * `paymentStatus` directly, which mirrors the payments ledger — a payment is
 * recorded where the purchase lives, with a sum and a note, not from a summary
 * of it.
 */
export function InteractionItem({
  interaction,
}: {
  interaction: PatientInteractionDto;
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">
              {t.interactions.source[interaction.source]}
            </Badge>
            <span className="text-xs text-muted-foreground tabular-nums">
              {formatDate(interaction.occurredAt)}
            </span>
          </div>
          <p className="font-medium text-balance">{interaction.label}</p>
        </div>
        <PaymentBadge status={interaction.paymentStatus} />
      </div>
    </div>
  );
}

/* ------------------------------ timeline ------------------------------ */

type TimelineRow =
  | { kind: 'entry'; at: string; entry: PatientEntryDto }
  | { kind: 'interaction'; at: string; interaction: PatientInteractionDto };

/** Merged, date-descending list of entries and linked interactions. */
export function Timeline({
  entries,
  interactions,
  onEdit,
  onDelete,
  onDownload,
  onSend,
  downloadingId,
}: {
  entries: PatientEntryDto[];
  interactions: PatientInteractionDto[];
  onEdit: (entry: PatientEntryDto) => void;
  onDelete: (entry: PatientEntryDto) => void;
  onDownload: (entry: PatientEntryDto) => void;
  onSend: (entry: PatientEntryDto) => void;
  downloadingId: string | null;
}) {
  const rows: TimelineRow[] = React.useMemo(() => {
    const merged: TimelineRow[] = [
      ...entries.map((entry) => ({
        kind: 'entry' as const,
        at: entry.occurredAt,
        entry,
      })),
      ...interactions.map((interaction) => ({
        kind: 'interaction' as const,
        at: interaction.occurredAt,
        interaction,
      })),
    ];
    return merged.sort((a, b) => b.at.localeCompare(a.at));
  }, [entries, interactions]);

  return (
    <ol className="relative space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-border">
      {rows.map((row, i) => {
        const Icon =
          row.kind === 'entry' ? entryTypeIcon[row.entry.type] : undefined;
        return (
          <li
            key={
              row.kind === 'entry'
                ? row.entry.id
                : `${row.interaction.source}-${row.interaction.sourceId}-${i}`
            }
            className="relative pl-8"
          >
            <span
              className={cn(
                'absolute left-0 top-3.5 grid size-3.5 place-items-center rounded-full ring-4 ring-background',
                row.kind === 'entry' ? 'bg-primary' : 'bg-muted-foreground/50',
              )}
            >
              {Icon && <Icon className="size-2 text-primary-foreground" />}
            </span>
            {row.kind === 'entry' ? (
              <EntryCard
                entry={row.entry}
                onEdit={onEdit}
                onDelete={onDelete}
                onDownload={onDownload}
                onSend={onSend}
                downloading={downloadingId === row.entry.id}
              />
            ) : (
              <InteractionItem interaction={row.interaction} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

/** Inline contact/consent summary shown in the detail header. */
export function ConsentLine({ consentAt }: { consentAt: string | null }) {
  return (
    <span className="inline-flex items-center gap-2">
      <ConsentBadge consentAt={consentAt} />
      {consentAt && (
        <span className="text-xs text-muted-foreground">
          {t.consent.recordedOn} {formatDateTime(consentAt)}
        </span>
      )}
    </span>
  );
}
