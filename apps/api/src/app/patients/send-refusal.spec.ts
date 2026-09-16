import { ATTACHMENT_MAX_BYTES } from '@olesia/shared';

import { PatientEntryType } from '../../generated/prisma/enums';
import { sendRefusal, type SendableEntry } from './send-refusal';

const PRESCRIPTION: SendableEntry = {
  type: PatientEntryType.prescription,
  body: 'Paracetamol 120 mg, la nevoie.',
  fileUrl: null,
};
const DOCUMENT: SendableEntry = {
  type: PatientEntryType.document,
  body: null,
  fileUrl: 'b5f1.pdf',
};

describe('sendRefusal', () => {
  it('lets a written prescription and a stored document through', () => {
    expect(sendRefusal(PRESCRIPTION, true, null)).toBeNull();
    expect(sendRefusal(DOCUMENT, true, 1024)).toBeNull();
  });

  it('refuses the two entry types that are notes to herself', () => {
    for (const type of [PatientEntryType.anamnesis, PatientEntryType.note]) {
      expect(sendRefusal({ ...PRESCRIPTION, type }, true, null)).toEqual({
        status: 422,
        code: 'entry_not_sendable',
      });
    }
  });

  it('refuses a prescription with nothing written and a document with no file', () => {
    expect(sendRefusal({ ...PRESCRIPTION, body: '  \n ' }, true, null)).toEqual(
      { status: 422, code: 'entry_empty' },
    );
    expect(sendRefusal({ ...DOCUMENT, fileUrl: null }, true, null)).toEqual({
      status: 422,
      code: 'entry_empty',
    });
  });

  it('names the entry type before its emptiness, and both before the mail', () => {
    expect(
      sendRefusal(
        { type: PatientEntryType.note, body: null, fileUrl: null },
        false,
        null,
      )?.code,
    ).toBe('entry_not_sendable');
    expect(
      sendRefusal({ ...PRESCRIPTION, body: null }, false, null)?.code,
    ).toBe('entry_empty');
  });

  it('says mail is off before it says the file is too large', () => {
    expect(sendRefusal(DOCUMENT, false, ATTACHMENT_MAX_BYTES * 2)).toEqual({
      status: 503,
      code: 'mail_not_configured',
    });
  });

  it('sends exactly the limit and refuses one byte more, with both sizes', () => {
    expect(sendRefusal(DOCUMENT, true, ATTACHMENT_MAX_BYTES)).toBeNull();
    expect(sendRefusal(DOCUMENT, true, ATTACHMENT_MAX_BYTES + 1)).toEqual({
      status: 422,
      code: 'attachment_too_large',
      sizeBytes: ATTACHMENT_MAX_BYTES + 1,
      maxBytes: ATTACHMENT_MAX_BYTES,
    });
  });
});
