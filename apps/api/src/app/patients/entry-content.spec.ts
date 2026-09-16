import { PatientEntryType } from '../../generated/prisma/enums';
import { entryContentRefusal } from './entry-content';

const { anamnesis, note, prescription, document } = PatientEntryType;

describe('entryContentRefusal', () => {
  it('lets a prescription through with text, a file, or both', () => {
    for (const [body, fileUrl] of [
      ['Paracetamol 120 mg, la nevoie.', null],
      [null, 'b5f1.pdf'],
      ['Paracetamol 120 mg, la nevoie.', 'b5f1.pdf'],
    ]) {
      expect(entryContentRefusal({ type: prescription, body, fileUrl })).toBe(
        null,
      );
    }
  });

  it('refuses a prescription with neither, and whitespace is not text', () => {
    expect(
      entryContentRefusal({ type: prescription, body: null, fileUrl: null }),
    ).toBe('entry_empty');
    expect(
      entryContentRefusal({ type: prescription, body: ' \n\t', fileUrl: null }),
    ).toBe('entry_empty');
  });

  it('refuses a document without a file, whatever its text', () => {
    expect(
      entryContentRefusal({ type: document, body: 'Analize', fileUrl: null }),
    ).toBe('entry_empty');
    expect(
      entryContentRefusal({ type: document, body: null, fileUrl: 'b5f1.pdf' }),
    ).toBe(null);
  });

  it('refuses a file on anamnesis or a note', () => {
    for (const type of [anamnesis, note]) {
      expect(
        entryContentRefusal({ type, body: 'text', fileUrl: 'b5f1.pdf' }),
      ).toBe('entry_file_not_allowed');
    }
  });

  it('still lets a note or anamnesis be saved without text', () => {
    for (const type of [anamnesis, note]) {
      expect(entryContentRefusal({ type, body: null, fileUrl: null })).toBe(
        null,
      );
    }
  });
});
