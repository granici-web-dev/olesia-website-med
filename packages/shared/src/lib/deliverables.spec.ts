import { DeliverableProduct } from './enums.js';
import { DELIVERABLE_CATALOG, deliverableEntry } from './deliverables.js';

/**
 * The catalog is where a group-C order gets its price: both call sites
 * (`leads.startDeliverableCheckout` for the public form, `deliverable-orders`
 * for an order taken by phone) read it here and stamp `titleRo` and
 * `priceEur` onto the row, because a price that arrives in a request body is
 * not a price. The figures below are the brief's table — an edit that moves
 * one of them is an edit to what the practice charges, and has to be
 * deliberate. `unknown ⇒ undefined` is the other half: both call sites answer
 * `unknown_deliverable_product` on it, so a code that silently resolved to
 * something would sell the wrong product at the wrong price.
 */
describe('deliverableEntry', () => {
  it('stamps the brief price for each of the five products', () => {
    expect(deliverableEntry(DeliverableProduct.Menu7)?.priceEur).toBe(28);
    expect(deliverableEntry(DeliverableProduct.Menu14)?.priceEur).toBe(48);
    expect(deliverableEntry(DeliverableProduct.Menu30)?.priceEur).toBe(88);
    expect(
      deliverableEntry(DeliverableProduct.ProtocolPedNutri)?.priceEur,
    ).toBe(98);
    expect(
      deliverableEntry(DeliverableProduct.ProtocolComplementary)?.priceEur,
    ).toBe(98);
  });

  it('carries a Romanian label for each, because the back office is Romanian-only', () => {
    for (const code of Object.values(DeliverableProduct)) {
      expect(deliverableEntry(code)?.titleRo).toMatch(/\S/);
    }
  });

  it('answers undefined for an unknown code', () => {
    // The enum value, a near-miss, a Prisma-style name, the empty string.
    expect(deliverableEntry('menu_21')).toBeUndefined();
    expect(deliverableEntry('menu7')).toBeUndefined();
    expect(deliverableEntry('Menu7')).toBeUndefined();
    expect(deliverableEntry('protocol')).toBeUndefined();
    expect(deliverableEntry('')).toBeUndefined();
  });

  it('does not resolve a code by prefix or by case', () => {
    expect(deliverableEntry('MENU_7')).toBeUndefined();
    expect(deliverableEntry('menu_7 ')).toBeUndefined();
    expect(deliverableEntry(' menu_7')).toBeUndefined();
  });

  it('holds every enum member exactly once', () => {
    // The API calls this with Prisma's own generated enum, which is a
    // different nominal type carrying the same values: a member added to one
    // enum and not to the catalog is an order that cannot be placed.
    const codes = DELIVERABLE_CATALOG.map((e) => e.code);
    expect([...codes].sort()).toEqual(Object.values(DeliverableProduct).sort());
  });
});
