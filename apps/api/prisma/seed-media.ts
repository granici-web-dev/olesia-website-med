/**
 * The media appearances that were live on /media, moved out of
 * `apps/frontend/lib/media-appearances.ts`.
 *
 * All three are real, verifiable publications — the YouTube ids and the
 * Facebook permalink point at the actual broadcasts. As with the testimonials:
 * nothing goes in here that the client did not actually appear in.
 *
 * Thumbnails keep pointing at the files already committed under
 * `apps/frontend/public/assets/media/`. New entries added from the back office
 * get theirs copied into the API's own storage instead — either fetched from
 * YouTube or uploaded — so both paths end up locally hosted, which is what the
 * click-to-load embed rule requires.
 */

export interface SeedMediaAppearance {
  kind: 'tv' | 'radio' | 'conference' | 'press';
  outlet: string;
  show: string | null;
  /** ISO date, or null when the broadcaster never published one. */
  date: string | null;
  duration: string | null;
  titleRo: string;
  titleEn: string;
  titleRu: string;
  summaryRo: string;
  summaryEn: string;
  summaryRu: string;
  url: string;
  embedProvider: 'youtube' | 'facebook';
  embedRef: string;
  thumbUrl: string;
  thumbWidth: number;
  thumbHeight: number;
}

export const MEDIA_APPEARANCES: SeedMediaAppearance[] = [
  {
    kind: 'tv',
    outlet: 'Moldova 1',
    show: 'Bună dimineața',
    date: '2023-04-14',
    duration: '13:19',
    titleRo: 'Inapetența la copii',
    titleEn: 'Poor appetite in children',
    titleRu: 'Плохой аппетит у детей',
    summaryRo:
      'Invitată în studioul emisiunii „Bună dimineața” de la Moldova 1, într-o discuție despre inapetența la copii și despre ce pot face părinții.',
    summaryEn:
      'A studio conversation on Moldova 1’s morning show “Bună dimineața” about poor appetite in children and what parents can do about it.',
    summaryRu:
      'Разговор в студии утренней программы «Bună dimineața» на Moldova 1 о плохом аппетите у детей и о том, что могут сделать родители.',
    url: 'https://www.youtube.com/watch?v=U3PhOZMC-6o',
    embedProvider: 'youtube',
    embedRef: 'U3PhOZMC-6o',
    thumbUrl: '/assets/media/yt-U3PhOZMC-6o.jpg',
    thumbWidth: 1280,
    thumbHeight: 720,
  },
  {
    kind: 'tv',
    outlet: 'Canal 2',
    show: 'Telemagazin',
    date: '2022-12-19',
    duration: '11:56',
    titleRo: 'Gripa sezonieră: simptome, tratament, prevenție',
    titleEn: 'Seasonal flu: symptoms, treatment, prevention',
    titleRu: 'Сезонный грипп: симптомы, лечение, профилактика',
    summaryRo:
      'Despre gripa sezonieră la Telemagazin (Canal 2): pe cine afectează, cum prevenim boala, primele simptome și care sunt riscurile.',
    summaryEn:
      'On seasonal flu at Telemagazin (Canal 2): who it affects, how to prevent it, the first symptoms and the risks involved.',
    summaryRu:
      'О сезонном гриппе в программе Telemagazin (Canal 2): кого он затрагивает, как предотвратить болезнь, первые симптомы и риски.',
    url: 'https://www.youtube.com/watch?v=NxqYFNuPqbE',
    embedProvider: 'youtube',
    embedRef: 'NxqYFNuPqbE',
    thumbUrl: '/assets/media/yt-NxqYFNuPqbE.jpg',
    thumbWidth: 1280,
    thumbHeight: 720,
  },
  {
    kind: 'tv',
    outlet: 'TVR Moldova',
    show: 'TeleMatinal',
    // ⛔ The Facebook post carries no broadcast date — left null, not guessed.
    date: null,
    duration: '13:44',
    titleRo: 'Cum ne protejăm copiii de insolație',
    titleEn: 'How to protect children from heatstroke',
    titleRu: 'Как защитить детей от солнечного удара',
    summaryRo:
      'Zilele toride pot fi periculoase pentru cei mici — discuție la TeleMatinal (TVR Moldova) despre insolație și protecția copiilor pe caniculă.',
    summaryEn:
      'Scorching days can be dangerous for little ones — a TeleMatinal (TVR Moldova) conversation on heatstroke and keeping children safe in a heatwave.',
    summaryRu:
      'Знойные дни опасны для малышей — беседа в программе TeleMatinal (TVR Moldova) о солнечном ударе и защите детей в жару.',
    url: 'https://www.facebook.com/watch/?v=2859077347632258',
    embedProvider: 'facebook',
    embedRef: 'https://www.facebook.com/TeleMATINAL/videos/2859077347632258/',
    thumbUrl: '/assets/media/fb-2859077347632258.jpg',
    thumbWidth: 1280,
    thumbHeight: 720,
  },
];
