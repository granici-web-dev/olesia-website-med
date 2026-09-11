import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ro } from '@/i18n/ro';

/**
 * The three-language tab strip every trilingual form carries, with a dot on
 * the tabs whose fields have failed validation.
 *
 * Five forms had their own copy. RU never carries a dot: `*Ru` is nullable
 * everywhere and falls back to RO, so none of its fields can fail (`AGENTS.md`
 * R3).
 */
export function LocaleTabsList({
  roHasError,
  enHasError,
}: {
  roHasError?: boolean;
  enHasError?: boolean;
}) {
  return (
    <TabsList>
      <TabsTrigger value="ro" className="gap-1.5">
        {ro.common.langRo}
        {roHasError && (
          <span className="size-1.5 rounded-full bg-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="en" className="gap-1.5">
        {ro.common.langEn}
        {enHasError && (
          <span className="size-1.5 rounded-full bg-destructive" />
        )}
      </TabsTrigger>
      <TabsTrigger value="ru">{ro.common.langRu}</TabsTrigger>
    </TabsList>
  );
}
