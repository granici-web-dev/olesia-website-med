import type { MediaAppearanceDto } from '@olesia/shared';
import type { MediaAppearance } from '../../generated/prisma/client';

export function toMediaAppearanceDto(
  m: MediaAppearance,
): MediaAppearanceDto {
  return {
    id: m.id,
    kind: m.kind as MediaAppearanceDto['kind'],
    outlet: m.outlet,
    show: m.show,
    date: m.date ? m.date.toISOString() : null,
    duration: m.duration,
    titleRo: m.titleRo,
    titleEn: m.titleEn,
    titleRu: m.titleRu,
    summaryRo: m.summaryRo,
    summaryEn: m.summaryEn,
    summaryRu: m.summaryRu,
    url: m.url,
    embedProvider: m.embedProvider as MediaAppearanceDto['embedProvider'],
    embedRef: m.embedRef,
    thumbUrl: m.thumbUrl,
    thumbWidth: m.thumbWidth,
    thumbHeight: m.thumbHeight,
    sortOrder: m.sortOrder,
    active: m.active,
  };
}
