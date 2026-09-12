import { expect, test } from '@playwright/test';

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  API_URL,
  SITE_URL,
  TEST_CARD,
} from './env';

/**
 * The one path nothing else covers: a stranger's money turning into a ticket
 * on the doctor's desk.
 *
 * Every piece of this is pinned by a unit test — `checkoutAmount`,
 * `toPaymentState`, the callback signature, `addWorkingMinutes`, `dueAt` from
 * the bank's moment — and none of that proves the pieces are wired to each
 * other. What this asserts is the wiring: the form opens a real session at
 * maib's sandbox, a card charged there turns the ticket from
 * `awaiting_payment` into `open`, the return page tells the payer so, and the
 * back office can then see a ticket with a deadline on it. Before the money
 * lands the ticket is deliberately invisible to the doctor, which is the other
 * half of the assertion.
 *
 * It is run by hand, never in CI: it needs a database, the maib sandbox keys
 * and a network round trip to a third party. TESTING.md has the command and
 * the preconditions; `global-setup.ts` refuses to start without them.
 *
 * The bank's callback is not part of this. It has never once been delivered —
 * there is no public HTTPS host for it to reach — so the status here arrives
 * the way it does in the live runs recorded in PLAN.md 12b: by polling.
 */

interface Ticket {
  id: string;
  clientEmail: string;
  status: string;
  paymentStatus: string;
  dueAt: string | null;
  question: string;
}

async function listTickets(): Promise<Ticket[]> {
  const login = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  expect(
    login.ok,
    `admin login answered ${login.status} — is the dev seed applied?`,
  ).toBe(true);
  const { accessToken } = (await login.json()) as { accessToken: string };

  const res = await fetch(`${API_URL}/quick-questions?page=1&pageSize=50`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  expect(res.ok, `GET /quick-questions answered ${res.status}`).toBe(true);
  const body = (await res.json()) as { items: Ticket[] };
  return body.items;
}

test('an EXPRESS question paid with a sandbox card becomes a ticket with a deadline', async ({
  page,
}) => {
  // The question text is the handle on this run's row: two people asking the
  // same thing on the same day is exactly what `intentKey` deduplicates, and a
  // test that reuses a question would be asserting against the previous run.
  const marker = `e2e-${Date.now()}`;
  const question = `Copilul de 3 ani refuza legumele de doua saptamani. Ce facem? [${marker}]`;
  const email = `e2e+${marker}@example.md`;

  await test.step('fill the EXPRESS checkout form', async () => {
    await page.goto(`${SITE_URL}/ro/checkout/express`);

    // The summary is read from the catalog, never written by the page, so this
    // is also the assertion that the service is on sale at all.
    await expect(
      page.getByRole('heading', { name: 'Trimite întrebarea medicului' }),
    ).toBeVisible();
    // Scoped to the summary aside, not the page: "Întrebare EXPRESS" is also a
    // collapsed nav item, and `.first()` picks that one.
    const summary = page.getByRole('complementary');
    await expect(
      summary.getByText('Un răspuns scris de la medic'),
    ).toBeVisible();
    await expect(summary.getByText(/8\s*€/)).toBeVisible();

    // By label, not by id: the ids come from React's `useId` and change
    // between builds.
    await page.getByLabel('Nume și prenume').fill('Test Test');
    await page.getByLabel('Email', { exact: true }).fill(email);
    await page.getByLabel('Telefon (opțional)').fill('+37360000000');
    await page.getByLabel('Întrebarea ta').fill(question);

    // Consent, then terms. The honeypot input above them is off the tab order
    // and stays empty, which is the point of filling the form by label.
    await page.getByRole('checkbox').nth(0).check();
    await page.getByRole('checkbox').nth(1).check();
  });

  await test.step('the ticket is written down before the redirect, and is invisible', async () => {
    const before = await listTickets();
    expect(
      before.some((t) => t.question.includes(marker)),
      'nothing should have been written before the form is submitted',
    ).toBe(false);
  });

  await test.step('reach the bank', async () => {
    await page.getByRole('button', { name: /Continuă spre plată/ }).click();

    // `domcontentloaded`: the hosted page keeps a connection open while it
    // decides which methods this profile has, so 'load' can outlast the wait.
    await page.waitForURL(/checkout(-sandbox)?\.maib\.md/, {
      waitUntil: 'domcontentloaded',
    });
  });

  await test.step('the purchase is now recorded, and still not on the desk', async () => {
    // Pay-first has no way back into a tab somebody closed, so the ticket
    // exists before the card does — as `awaiting_payment`, which the back
    // office does not list. This is the assertion that an unpaid question
    // cannot reach the doctor.
    const waiting = await listTickets();
    expect(
      waiting.some((t) => t.question.includes(marker)),
      'an unpaid ticket must not appear in the back office',
    ).toBe(false);
  });

  await test.step('pay with the sandbox test card', async () => {
    await page.getByRole('button', { name: 'Card' }).click();

    // "Card" navigates the top level to the acquirer's own ClientHandler at
    // maib.ecommerce.md — the fields are not in an iframe, whatever the
    // hosted page's spinner suggests, and it can take twenty seconds.
    const cardNumber = page.locator('#cardnr');
    await cardNumber.waitFor({ state: 'visible', timeout: 90_000 });

    // Typed, not filled. The expiry input is a keypress-driven mask that
    // splits what you type into two hidden fields (`#validMONTH`,
    // `#validYEAR`), and those two are what the form posts. `fill()` sets the
    // visible value and fires one `input` event, so the mask never runs: the
    // field looks correct, the hidden pair stays empty, and "Achită" is
    // silently rejected — which reads as a bank that never answered.
    await cardNumber.pressSequentially(TEST_CARD.number, { delay: 30 });
    await page
      .locator('#expiryDate')
      .pressSequentially(TEST_CARD.expiry.replace('/', ''), { delay: 60 });
    await page.locator('#cvc2').pressSequentially(TEST_CARD.cvv, { delay: 30 });
    const holder = page.locator('input[placeholder="Ex: Ion Popa"]');
    if (await holder.count()) await holder.fill(TEST_CARD.holder);

    // The assertion that the mask did run, stated here rather than left to be
    // rediscovered from a 60-second timeout two steps later.
    await expect(page.locator('#validMONTH')).toHaveValue(
      TEST_CARD.expiry.slice(0, 2),
    );
    await expect(page.locator('#validYEAR')).toHaveValue(
      TEST_CARD.expiry.slice(-2),
    );

    // The acquirer validates on blur and only then enables "Achită"; clicking
    // it while it is still disabled is silently ignored, which looks exactly
    // like a bank that never answered. So: wait for it, click it, and confirm
    // the page actually left the card form.
    const pay = page.locator('#submit_button');
    await expect(pay).toBeEnabled();
    await pay.click();
    await expect(pay).toBeHidden({ timeout: 60_000 });
  });

  await test.step('land on the return page with the payment confirmed', async () => {
    await page.waitForURL(/\/payment\/(success|failed)/, {
      waitUntil: 'domcontentloaded',
      timeout: 120_000,
    });

    // The page holds no logic of its own — the redirect's parameters are
    // user-controllable, so it asks our API, which asks the bank. Which means
    // this heading appearing is the bank's answer, not the URL's.
    await expect(page.getByText('Plata a fost confirmată')).toBeVisible({
      timeout: 90_000,
    });
    await expect(
      page.getByText('Întrebarea ta a ajuns la medic.'),
    ).toBeVisible();

    // The amount is charged in whatever `PAYMENT_CURRENCY` says, which locally
    // is MDL because the sandbox profile has no EUR. The catalog still quotes
    // euro on the summary card, and that difference is the sandbox's, not ours.
    // `\s`, not a literal space: Chromium's ICU puts a non-breaking space
    // between the number and the currency where Node's puts a plain one.
    await expect(page.getByText(/8,00\s(MDL|EUR)/)).toBeVisible();
  });

  await test.step('the back office now has an open ticket with a deadline', async () => {
    const tickets = await listTickets();
    const ticket = tickets.find((t) => t.question.includes(marker));

    expect(
      ticket,
      'the paid ticket should be listed for the doctor',
    ).toBeDefined();
    expect(ticket?.status).toBe('open');
    expect(ticket?.paymentStatus).toBe('confirmed');
    expect(ticket?.clientEmail).toBe(email);

    // `dueAt` is counted from the bank's `paidAt` through the declared working
    // hours, not from now and not from when the sweep noticed — so the only
    // thing worth asserting here is that it exists and is in the future.
    expect(
      ticket?.dueAt,
      'a paid ticket must carry an SLA deadline',
    ).toBeTruthy();
    expect(new Date(ticket!.dueAt!).getTime()).toBeGreaterThan(Date.now());
  });
});
