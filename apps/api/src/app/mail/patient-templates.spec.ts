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
  DOCUMENT_TEMPLATES,
  PAYMENT_RECEIPT_TEMPLATES,
  PREP_TEMPLATES,
  PRESCRIPTION_TEMPLATES,
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
      PRESCRIPTION_TEMPLATES,
      DOCUMENT_TEMPLATES,
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
      render(PAYMENT_RECEIPT_TEMPLATES, 'en', {
        ...RECEIPT,
        nextStep: step,
      }).lines.join('\n'),
    ).toContain('downloads from here');
    expect(
      render(PAYMENT_RECEIPT_TEMPLATES, 'ru', {
        ...RECEIPT,
        nextStep: step,
      }).lines.join('\n'),
    ).toContain('скачать здесь');
  });
});

/** Sent from the dossier (docs/shape-send-prescription.md). */
describe('the prescription and the document', () => {
  const PRESCRIPTION = {
    title: 'Tratament otită',
    body: '1. Amoxicilină 250 mg — de 2 ori pe zi, 7 zile.\n2. Nurofen la nevoie.',
    attached: false,
  };

  it('carries the prescription text verbatim, in every language', () => {
    for (const locale of ['ro', 'en', 'ru']) {
      const { lines } = render(PRESCRIPTION_TEMPLATES, locale, PRESCRIPTION);
      expect(lines).toContain(PRESCRIPTION.body);
      expect(lines).toContain(PRESCRIPTION.title);
    }
  });

  it('leaves no empty title line when the prescription has none', () => {
    const untitled = render(PRESCRIPTION_TEMPLATES, 'ro', {
      ...PRESCRIPTION,
      title: null,
    });
    const titled = render(PRESCRIPTION_TEMPLATES, 'ro', PRESCRIPTION);
    expect(untitled.lines).toHaveLength(titled.lines.length - 2);
  });

  it('names the document it attaches, in every language', () => {
    for (const locale of ['ro', 'en', 'ru']) {
      const { lines } = render(DOCUMENT_TEMPLATES, locale, {
        title: 'Analize iunie.pdf',
      });
      expect(lines.join('\n')).toContain('Analize iunie.pdf');
    }
  });

  it('greets nobody by name: the dossier may be the child, the inbox the parent', () => {
    expect(render(PRESCRIPTION_TEMPLATES, 'ro', PRESCRIPTION).lines[0]).toBe(
      'Bună ziua,',
    );
    expect(render(DOCUMENT_TEMPLATES, 'ru', { title: 'x' }).lines[0]).toBe(
      'Здравствуйте!',
    );
  });

  it('writes Romanian for a language it does not have', () => {
    expect(render(PRESCRIPTION_TEMPLATES, 'de', PRESCRIPTION)).toEqual(
      render(PRESCRIPTION_TEMPLATES, 'ro', PRESCRIPTION),
    );
    expect(render(DOCUMENT_TEMPLATES, null, { title: 'x' }).subject).toBe(
      'Un document medical pentru dumneavoastră',
    );
  });

  describe('with a file (docs/shape-prescription-file.md)', () => {
    const LOCALES = ['ro', 'en', 'ru'];
    const ATTACHED_ALSO = [
      'Rețeta este atașată și ca fișier la acest email.',
      'The prescription is also attached to this email as a file.',
      'Рецепт также приложен к письму файлом.',
    ];

    it('keeps the text-only message exactly as step 19 sent it', () => {
      expect(render(PRESCRIPTION_TEMPLATES, 'ro', PRESCRIPTION).lines).toEqual([
        'Bună ziua,',
        '',
        'Mai jos este rețeta de la Dr. Olesea Jalba.',
        '',
        PRESCRIPTION.title,
        '',
        PRESCRIPTION.body,
        '',
        'Dacă aveți întrebări despre administrare, răspundeți la acest email.',
        '',
        'Cu drag,',
        'Dr. Olesea Jalba',
      ]);
    });

    it('says a file-only prescription is attached, with no empty body block', () => {
      LOCALES.forEach((locale, i) => {
        const { lines } = render(PRESCRIPTION_TEMPLATES, locale, {
          title: 'Rețetă',
          body: null,
          attached: true,
        });
        expect(lines[2]).toMatch(/atașată|attached|вложении/);
        expect(lines).not.toContain(ATTACHED_ALSO[i]);
        expect(lines.slice(4)).toEqual([
          'Rețetă',
          '',
          ...render(PRESCRIPTION_TEMPLATES, locale, PRESCRIPTION).lines.slice(
            8,
          ),
        ]);
      });
    });

    it('carries the text verbatim and one line naming the attachment', () => {
      LOCALES.forEach((locale, i) => {
        const textOnly = render(PRESCRIPTION_TEMPLATES, locale, PRESCRIPTION);
        const { lines } = render(PRESCRIPTION_TEMPLATES, locale, {
          ...PRESCRIPTION,
          attached: true,
        });
        expect(lines).toContain(PRESCRIPTION.body);
        expect(lines).toEqual([
          ...textOnly.lines.slice(0, 8),
          ATTACHED_ALSO[i],
          '',
          ...textOnly.lines.slice(8),
        ]);
      });
    });

    it('keeps the prescription subject in every shape', () => {
      for (const locale of LOCALES) {
        const subject = render(
          PRESCRIPTION_TEMPLATES,
          locale,
          PRESCRIPTION,
        ).subject;
        for (const vars of [
          { ...PRESCRIPTION, attached: true },
          { ...PRESCRIPTION, body: null, attached: true },
        ]) {
          expect(render(PRESCRIPTION_TEMPLATES, locale, vars).subject).toBe(
            subject,
          );
        }
      }
    });
  });
});
