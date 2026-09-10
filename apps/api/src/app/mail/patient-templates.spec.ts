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
