/**
 * Service-specific preparation checklists (RO) sent 24h before a group-A
 * consultation (module_calendly.md §8.6). Keyed by `Service.code`.
 */
export const PREP_CHECKLISTS: Record<string, string> = {
  pediatric:
    'Pregătiți: carnetul de vaccinări, lista simptomelor și a medicamentelor administrate, eventuale analize recente.',
  nutrition_copii:
    'Pregătiți: jurnalul alimentar pe 3 zile, analizele recente (dacă există) și lista suplimentelor administrate.',
  nutrition_adulti:
    'Pregătiți: jurnalul alimentar pe 3 zile, analizele recente (dacă există) și lista suplimentelor administrate.',
  integrative:
    'Pregătiți: istoricul medical, analizele recente, jurnalul alimentar pe 3 zile și lista întrebărilor.',
};

const PREP_DEFAULT =
  'Pregătiți istoricul medical recent și lista întrebărilor pentru consultație.';

/** The checklist for a service code, falling back to a generic one. */
export function prepChecklist(code: string): string {
  return PREP_CHECKLISTS[code] ?? PREP_DEFAULT;
}
