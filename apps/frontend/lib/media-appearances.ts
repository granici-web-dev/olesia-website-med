/* ──────────────────────────────────────────────────────────────────────────
   Apariții media (brief §7 / Q17 · client answers v2 §6) — TV, radio and
   conference appearances shown on /media.

   Rules baked into this data shape:
   · We NEVER self-host the recordings. Broadcast rights belong to the channel,
     the files are 30–170 MB, and the client only has low-res copies. Every item
     points at its original publication (`url`) and is embedded from there.
   · Embeds are CLICK-TO-LOAD (see MediaGallery): the third-party iframe is
     injected only after the visitor presses play, so YouTube/Facebook set no
     cookies on first paint. That keeps the page compliant with the cookie
     banner the client asked for (Accept all / Reject / Customize).
   · Thumbnails are stored locally (`/assets/media/*`) — Facebook's `og:image`
     URLs are signed and expire, and calling ytimg/fbcdn before consent would
     re-introduce the third-party request we just avoided.

   Local archive copies of the three recordings live in `docs/*.mp4`
   (git-ignored). Trilingual (RO default · EN · RU); moves to the back-office
   `media-appearances` module in the backend pass.
   ────────────────────────────────────────────────────────────────────────── */

export type Bi = { ro: string; en: string; ru: string };

export type MediaEmbed =
  | { provider: 'youtube'; videoId: string }
  /** Facebook needs the canonical page permalink, not the /watch/?v= form. */
  | { provider: 'facebook'; permalink: string };

export interface MediaAppearance {
  id: string;
  /** Only 'tv' so far; radio/conferences/presentations arrive with the client's full list. */
  kind: 'tv' | 'radio' | 'conference' | 'press';
  /** Broadcaster, e.g. "Moldova 1". */
  outlet: string;
  /** Programme name, e.g. "Bună dimineața". */
  show?: string;
  /** ISO date of the publication + a display label. Omitted when unknown. */
  date?: { iso: string; label: Bi };
  /** Runtime, mm:ss. */
  duration?: string;
  title: Bi;
  summary: Bi;
  /** Canonical publication URL — always offered as an outbound link. */
  url: string;
  embed: MediaEmbed;
  thumb: string;
  thumbW: number;
  thumbH: number;
}

export const MEDIA_APPEARANCES: MediaAppearance[] = [
  {
    id: 'inapetenta-la-copii',
    kind: 'tv',
    outlet: 'Moldova 1',
    show: 'Bună dimineața',
    date: {
      iso: '2023-04-14',
      label: { ro: 'Aprilie 2023', en: 'April 2023', ru: 'Апрель 2023' },
    },
    duration: '13:19',
    title: {
      ro: 'Inapetența la copii',
      en: 'Poor appetite in children',
      ru: 'Плохой аппетит у детей',
    },
    summary: {
      ro: 'Invitată în studioul emisiunii „Bună dimineața” de la Moldova 1, într-o discuție despre inapetența la copii și despre ce pot face părinții.',
      en: 'A studio conversation on Moldova 1’s morning show “Bună dimineața” about poor appetite in children and what parents can do about it.',
      ru: 'Разговор в студии утренней программы «Bună dimineața» на Moldova 1 о плохом аппетите у детей и о том, что могут сделать родители.',
    },
    url: 'https://www.youtube.com/watch?v=U3PhOZMC-6o',
    embed: { provider: 'youtube', videoId: 'U3PhOZMC-6o' },
    thumb: '/assets/media/yt-U3PhOZMC-6o.jpg',
    thumbW: 1280,
    thumbH: 720,
  },
  {
    id: 'gripa-sezoniera',
    kind: 'tv',
    outlet: 'Canal 2',
    show: 'Telemagazin',
    date: {
      iso: '2022-12-19',
      label: { ro: 'Decembrie 2022', en: 'December 2022', ru: 'Декабрь 2022' },
    },
    duration: '11:56',
    title: {
      ro: 'Gripa sezonieră: simptome, tratament, prevenție',
      en: 'Seasonal flu: symptoms, treatment, prevention',
      ru: 'Сезонный грипп: симптомы, лечение, профилактика',
    },
    summary: {
      ro: 'Despre gripa sezonieră la Telemagazin (Canal 2): pe cine afectează, cum prevenim boala, primele simptome și care sunt riscurile.',
      en: 'On seasonal flu at Telemagazin (Canal 2): who it affects, how to prevent it, the first symptoms and the risks involved.',
      ru: 'О сезонном гриппе в программе Telemagazin (Canal 2): кого он затрагивает, как предотвратить болезнь, первые симптомы и риски.',
    },
    url: 'https://www.youtube.com/watch?v=NxqYFNuPqbE',
    embed: { provider: 'youtube', videoId: 'NxqYFNuPqbE' },
    thumb: '/assets/media/yt-NxqYFNuPqbE.jpg',
    thumbW: 1280,
    thumbH: 720,
  },
  {
    id: 'insolatie-la-copii',
    kind: 'tv',
    outlet: 'TVR Moldova',
    show: 'TeleMatinal',
    // ⛔ Broadcast date not published on the Facebook post — ask the client.
    duration: '13:44',
    title: {
      ro: 'Cum ne protejăm copiii de insolație',
      en: 'How to protect children from heatstroke',
      ru: 'Как защитить детей от солнечного удара',
    },
    summary: {
      ro: 'Zilele toride pot fi periculoase pentru cei mici — discuție la TeleMatinal (TVR Moldova) despre insolație și protecția copiilor pe caniculă.',
      en: 'Scorching days can be dangerous for little ones — a TeleMatinal (TVR Moldova) conversation on heatstroke and keeping children safe in a heatwave.',
      ru: 'Знойные дни опасны для малышей — беседа в программе TeleMatinal (TVR Moldova) о солнечном ударе и защите детей в жару.',
    },
    url: 'https://www.facebook.com/watch/?v=2859077347632258',
    embed: {
      provider: 'facebook',
      permalink: 'https://www.facebook.com/TeleMATINAL/videos/2859077347632258/',
    },
    thumb: '/assets/media/fb-2859077347632258.jpg',
    thumbW: 1280,
    thumbH: 720,
  },
];
