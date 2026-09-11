import { describe, expect, it } from 'vitest';

import { serviceDescription } from './service-content';

/**
 * A compiled-in description used to shadow the one the client wrote (audit A6,
 * F7). Now that there is only the API's, what matters is the fallback: an
 * untranslated field must read as Romanian, and an empty one must render
 * nothing at all rather than an empty paragraph.
 */
const service = (ro: string, en: string, ru: string | null) => ({
  descriptionRo: ro,
  descriptionEn: en,
  descriptionRu: ru,
});

describe('serviceDescription', () => {
  const full = service('Consultație video.', 'Video consultation.', 'Видеоконсультация.');

  it('picks the reader’s language', () => {
    expect(serviceDescription('ro', full)).toBe('Consultație video.');
    expect(serviceDescription('en', full)).toBe('Video consultation.');
    expect(serviceDescription('ru', full)).toBe('Видеоконсультация.');
  });

  it('falls back to Romanian when Russian was never written', () => {
    expect(serviceDescription('ru', service('Consultație video.', 'Video.', null)))
      .toBe('Consultație video.');
  });

  it('treats a cleared field as missing, the way the back office writes it', () => {
    expect(serviceDescription('ru', service('Consultație video.', 'Video.', '   ')))
      .toBe('Consultație video.');
    expect(serviceDescription('en', service('Consultație video.', '', null)))
      .toBe('Consultație video.');
  });

  it('says nothing when there is nothing to say', () => {
    expect(serviceDescription('ru', service('', '', null))).toBe('');
    expect(serviceDescription('ro', service('  ', '', ''))).toBe('');
  });

  it('treats an unknown locale as Romanian', () => {
    expect(serviceDescription('de', full)).toBe('Consultație video.');
  });
});
