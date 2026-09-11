import { toast } from 'sonner';

import { ro } from '@/i18n/ro';

/**
 * Copy text to the clipboard, and say so when it did not work.
 *
 * `writeText` rejects on a denied permission, an insecure origin and a
 * document that has lost focus. Every place this is called from is a hand-off
 * the operator is about to paste into an email to a patient or a buyer, so a
 * silent rejection means she pastes whatever was in the clipboard before.
 *
 * Returns whether the text is actually there, for the caller that reports
 * success on the button instead of with a toast.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    toast.error(ro.common.copyFailed);
    return false;
  }
}
