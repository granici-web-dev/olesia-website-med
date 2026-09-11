/**
 * Which language a patient is written to in.
 *
 * The fallback is the part worth pinning: every row that predates the
 * `locale` column reads as `ro`, and so does anything a hand-edit puts in
 * there. A parent getting the wrong language still gets their answer; an
 * exception thrown from a template loses it.
 */
import { Locale } from '@olesia/shared';

import {
  ANSWER_TEMPLATES,
  PAYMENT_RECEIPT_TEMPLATES,
  PREP_TEMPLATES,
  UPLOAD_LINK_TEMPLATES,
  render,
  templateLocale,
} from './patient-templates';

const ANSWER = {
  clientName: 'Ana',
  question: 'Copilul are febră de 2 zile.',
  answer: 'Măsurați temperatura seara.',
};

describe('templateLocale', () => {
  it('takes the three the site is written in', () => {
    expect(templateLocale('ro')).toBe(Locale.Ro);
    expect(templateLocale('en')).toBe(Locale.En);
    expect(templateLocale('ru')).toBe(Locale.Ru);
  });

  it('falls back to Romanian for anything else', () => {
    expect(templateLocale(null)).toBe(Locale.Ro);
    expect(templateLocale(undefined)).toBe(Locale.Ro);
    expect(templateLocale('')).toBe(Locale.Ro);
    expect(templateLocale('de')).toBe(Locale.Ro);
    expect(templateLocale('RU')).toBe(Locale.Ro);
  });
});

describe('render', () => {
  it('writes the answer in the language the question came in', () => {
    expect(render(ANSWER_TEMPLATES, 'ru', ANSWER).subject).toBe(
      'Ответ на ваш вопрос',
    );
    expect(render(ANSWER_TEMPLATES, 'en', ANSWER).subject).toBe(
      'The answer to your question',
    );
    expect(render(ANSWER_TEMPLATES, 'ro', ANSWER).subject).toBe(
      'Răspunsul la întrebarea dumneavoastră',
    );
  });

  it('falls back to Romanian rather than failing on an unknown locale', () => {
    const fallback = render(ANSWER_TEMPLATES, 'de', ANSWER);
    expect(fallback).toEqual(render(ANSWER_TEMPLATES, 'ro', ANSWER));
  });

  it('carries the question and the answer into the body, whatever the locale', () => {
    for (const locale of ['ro', 'en', 'ru', null]) {
      const body = render(ANSWER_TEMPLATES, locale, ANSWER).lines.join('\n');
      expect(body).toContain(ANSWER.question);
      expect(body).toContain(ANSWER.answer);
      expect(body).toContain(ANSWER.clientName);
    }
  });

  it('has all three locales for every message, per AGENTS.md R3', () => {
    for (const templates of [
      ANSWER_TEMPLATES,
      PREP_TEMPLATES,
      UPLOAD_LINK_TEMPLATES,
    ]) {
      expect(Object.keys(templates).sort()).toEqual(['en', 'ro', 'ru']);
    }
  });

  it('omits the video line when a consultation has no link yet', () => {
    const withLink = render(PREP_TEMPLATES, 'ro', {
      clientName: 'Ana',
      serviceTitle: 'Consultație pediatrică',
      startsAt: '12 mai 2026, 10:00',
      videoUrl: 'https://meet.google.com/abc',
      checklist: '- carnetul de vaccinări',
    });
    const withoutLink = render(PREP_TEMPLATES, 'ro', {
      clientName: 'Ana',
      serviceTitle: 'Consultație pediatrică',
      startsAt: '12 mai 2026, 10:00',
      videoUrl: null,
      checklist: '- carnetul de vaccinări',
    });
    expect(withLink.lines.join('\n')).toContain('https://meet.google.com/abc');
    expect(withoutLink.lines.join('\n')).not.toContain('Link video');
  });
});

/**
 * The receipt's "what you can do now" block.
 *
 * Here because with no SMTP the receipt is the one part of the purchase nobody
 * can look at, and it is also the part carrying the link: a group-C buyer is
 * told where to send their documents, and a material's buyer is handed the
 * file. A block that silently rendered nothing would look exactly like a block
 * that rendered — until somebody's mailbox existed.
 */
const RECEIPT = {
  clientName: 'Maria',
  orderId: 'material-abc123',
  description: 'Meniu BLW — prima săptămână',
  amount: '9,00 EUR',
  paidAt: '11 septembrie 2026 la 15:16',
  merchant: '',
};

describe('the payment receipt', () => {
  it('names what was bought, in every language', () => {
    for (const locale of ['ro', 'en', 'ru']) {
      const { lines } = render(PAYMENT_RECEIPT_TEMPLATES, locale, RECEIPT);
      expect(lines.join('\n')).toContain('Meniu BLW — prima săptămână');
    }
  });

  it('carries no next-step block when there is nothing to hand over', () => {
    const { lines } = render(PAYMENT_RECEIPT_TEMPLATES, 'ro', RECEIPT);
    expect(lines.join('\n')).not.toContain('http');
  });

  it('hands a material buyer the download link, its date and its count', () => {
    const { lines } = render(PAYMENT_RECEIPT_TEMPLATES, 'ro', {
      ...RECEIPT,
      nextStep: {
        kind: 'material_download',
        url: 'https://api.example.md/materials/download/tok',
        expiresAt: '11 octombrie 2026',
        downloads: 10,
      },
    });
    const body = lines.join('\n');
    expect(body).toContain('https://api.example.md/materials/download/tok');
    expect(body).toContain('11 octombrie 2026');
    expect(body).toContain('10');
  });

  it('tells a group-C buyer where to send their documents', () => {
    const { lines } = render(PAYMENT_RECEIPT_TEMPLATES, 'ro', {
      ...RECEIPT,
      description: 'Meniu personalizat · 7 zile',
      nextStep: {
        kind: 'order_documents',
        url: 'https://site.example.md/ro/incarcare/tok',
        expiresAt: '11 octombrie 2026',
      },
    });
    const body = lines.join('\n');
    expect(body).toContain('https://site.example.md/ro/incarcare/tok');
    expect(body).toContain('documentele');
  });

  it('writes the block in the language the buyer wrote to us in', () => {
    const step = {
      kind: 'material_download' as const,
      url: 'https://api.example.md/materials/download/tok',
      expiresAt: '11 October 2026',
      downloads: 10,
    };
    expect(
      render(PAYMENT_RECEIPT_TEMPLATES, 'en', { ...RECEIPT, nextStep: step })
        .lines.join('\n'),
    ).toContain('downloads from here');
    expect(
      render(PAYMENT_RECEIPT_TEMPLATES, 'ru', { ...RECEIPT, nextStep: step })
        .lines.join('\n'),
    ).toContain('скачать здесь');
  });
});
