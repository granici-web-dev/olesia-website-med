import type { PublicMediaAppearanceDto } from '@/lib/api';

/**
 * Committed copy of the three real TV appearances, used only when the API
 * returns nothing — the same shape `site-media.ts` uses for the hero video.
 *
 * ⚠ This reverses the note that used to sit in `app/[locale]/media/page.tsx`
 * ("deliberately no local fallback"). That reasoning — a stale copy would drift
 * from what the client edits — still holds and is why the API always wins when
 * it answers. What changed is the other side of the trade: with the API not yet
 * deployed, "no fallback" does not mean a brief outage, it means /media renders
 * `Materiale 0` for every visitor. An empty page is not the honest option here;
 * it is a page that silently claims she has never been on television.
 *
 * These are not invented. All three are documented in
 * `docs/brief-changes-2026-06-24.md` with publication URLs the client sent on
 * 2026-07-26, verified via oEmbed/OG metadata, and they mirror the rows already
 * entered in the back office. Thumbnails are the self-hosted files in
 * `public/assets/media/`, so the page paints with no third-party request.
 *
 * ⛔ Remove this file once the API is deployed and serving the same rows —
 * two sources of truth for the same content is exactly the drift the original
 * note warned about. Until then, keep it in step with the back office by hand.
 *
 * Known gaps, unchanged from the DB rows: the TVR Moldova item has no public
 * date (⛔ ask the client), and the summaries are ours, written from the
 * on-screen topic rather than the full 12–14 minutes — worth her read-through.
 */
export const PLACEHOLDER_MEDIA: PublicMediaAppearanceDto[] = [
  {
    id: 'placeholder-yt-U3PhOZMC-6o',
    kind: 'tv',
    outlet: 'Moldova 1',
    show: 'Bună dimineața',
    date: '2023-04-14T00:00:00.000Z',
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
    sortOrder: 1,
    active: true,
  },
  {
    id: 'placeholder-yt-NxqYFNuPqbE',
    kind: 'tv',
    outlet: 'Canal 2',
    show: 'Telemagazin',
    date: '2022-12-19T00:00:00.000Z',
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
    sortOrder: 2,
    active: true,
  },
  {
    id: 'placeholder-fb-2859077347632258',
    kind: 'tv',
    outlet: 'TVR Moldova',
    show: 'TeleMatinal',
    // The broadcaster never published one — the page omits the date rather
    // than guessing it.
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
    sortOrder: 3,
    active: true,
  },
];
