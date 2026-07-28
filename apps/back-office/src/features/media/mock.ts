import type {
  MediaAppearance,
  MediaAppearanceInput,
  StoredImage,
} from '@/features/media/types';

/* ------------------------------------------------------------------ *
 * Mock data layer — in-memory, shaped like the real endpoints.
 * The two entries are real broadcasts (see prisma/seed-media.ts).
 * ------------------------------------------------------------------ */

let store: MediaAppearance[] = [
  {
    id: 'm1',
    kind: 'tv',
    outlet: 'Moldova 1',
    show: 'Bună dimineața',
    date: '2023-04-14T00:00:00.000Z',
    duration: '13:19',
    titleRo: 'Inapetența la copii',
    titleEn: 'Poor appetite in children',
    titleRu: 'Плохой аппетит у детей',
    summaryRo:
      'Discuție despre inapetența la copii și despre ce pot face părinții.',
    summaryEn:
      'A conversation about poor appetite in children and what parents can do.',
    summaryRu:
      'Разговор о плохом аппетите у детей и о том, что могут сделать родители.',
    url: 'https://www.youtube.com/watch?v=U3PhOZMC-6o',
    embedProvider: 'youtube',
    embedRef: 'U3PhOZMC-6o',
    thumbUrl: '/assets/media/yt-U3PhOZMC-6o.jpg',
    thumbWidth: 1280,
    thumbHeight: 720,
    sortOrder: 1,
    active: true,
  },
  {
    id: 'm2',
    kind: 'tv',
    outlet: 'TVR Moldova',
    show: 'TeleMatinal',
    date: null,
    duration: '13:44',
    titleRo: 'Cum ne protejăm copiii de insolație',
    titleEn: 'How to protect children from heatstroke',
    titleRu: 'Как защитить детей от солнечного удара',
    summaryRo: 'Despre insolație și protecția copiilor pe caniculă.',
    summaryEn: 'On heatstroke and keeping children safe in a heatwave.',
    summaryRu: 'О солнечном ударе и защите детей в жару.',
    url: 'https://www.facebook.com/watch/?v=2859077347632258',
    embedProvider: 'facebook',
    embedRef: 'https://www.facebook.com/TeleMATINAL/videos/2859077347632258/',
    thumbUrl: '/assets/media/fb-2859077347632258.jpg',
    thumbWidth: 1280,
    thumbHeight: 720,
    sortOrder: 2,
    active: true,
  },
];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchMedia(): Promise<MediaAppearance[]> {
  await delay(400);
  return store.slice().sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createMedia(
  input: MediaAppearanceInput,
): Promise<MediaAppearance> {
  await delay(400);
  const created: MediaAppearance = {
    ...input,
    id: crypto.randomUUID(),
    sortOrder: store.reduce((max, m) => Math.max(max, m.sortOrder), 0) + 1,
  };
  store = [...store, created];
  return created;
}

export async function updateMedia(
  id: string,
  input: Partial<MediaAppearanceInput> & { sortOrder?: number },
): Promise<MediaAppearance> {
  await delay(350);
  let updated: MediaAppearance | undefined;
  store = store.map((m) => {
    if (m.id !== id) return m;
    updated = { ...m, ...input };
    return updated;
  });
  if (!updated) throw new Error(`Media appearance ${id} not found`);
  return updated;
}

export async function deleteMedia(id: string): Promise<void> {
  await delay(400);
  store = store.filter((m) => m.id !== id);
}

export async function fetchThumbnail(url: string): Promise<StoredImage> {
  await delay(600);
  const match = url.match(/(?:v=|youtu\.be\/)([\w-]{6,})/);
  if (!match) throw new Error('thumbnail_youtube_only');
  return {
    url: `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`,
    width: 480,
    height: 360,
  };
}

export async function uploadThumbnail(file: File): Promise<StoredImage> {
  await delay(600);
  return { url: URL.createObjectURL(file), width: 1280, height: 720 };
}
