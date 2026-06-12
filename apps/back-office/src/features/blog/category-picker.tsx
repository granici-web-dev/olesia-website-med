import { Checkbox } from '@/components/ui/checkbox';
import { ro } from '@/i18n/ro';
import type { Category } from '@/features/blog/types';

/** Controlled multi-select over the category list. */
export function CategoryPicker({
  categories,
  value,
  onChange,
}: {
  categories: Category[];
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {ro.blog.editor.noCategories}
      </p>
    );
  }

  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((x) => x !== id) : [...value, id],
    );

  return (
    <div className="space-y-0.5">
      {categories.map((c) => (
        <label
          key={c.id}
          className="flex cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
        >
          <Checkbox
            checked={value.includes(c.id)}
            onCheckedChange={() => toggle(c.id)}
          />
          {c.nameRo}
        </label>
      ))}
    </div>
  );
}
