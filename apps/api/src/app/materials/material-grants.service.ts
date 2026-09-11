import { randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { stat } from 'node:fs/promises';
import type { PurchaseNextStepDto } from '@olesia/shared';

import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PUBLIC_API_URL } from '../storage/storage.constants';

/**
 * How long a download link lives, and how many times it may be followed.
 *
 * Both are ours rather than the client's, and both are stated to the buyer in
 * the receipt and on the return page. Thirty days is long enough for a phone, a
 * laptop and a reinstall; ten downloads is short enough that a forwarded link
 * is not a distribution channel. Operational numbers with no legal weight — if
 * the client wants different ones, they are these two constants
 * (docs/shape-paid-deliverables-and-materials.md, open question 1).
 */
export const GRANT_TTL_DAYS = 30;
export const GRANT_MAX_DOWNLOADS = 10;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Whether a grant may still be followed.
 *
 * Exported and pure: this is the whole of who may have a file, and the three
 * ways it answers no — expired, exhausted, gone — are indistinguishable at the
 * endpoint on purpose (`PRINCIPLES.md`).
 */
export function grantUsable(
  grant: { expiresAt: Date; downloadCount: number; maxDownloads: number },
  now: Date = new Date(),
): boolean {
  if (grant.expiresAt <= now) return false;
  return grant.downloadCount < grant.maxDownloads;
}

/**
 * What a repeat purchase writes onto the grant that already exists.
 *
 * The expiry moves and the counter goes back to zero, because the buyer has
 * paid again. What is not in the patch is the point: **no token**, so a link
 * already sitting in somebody's inbox goes on working. That is the same
 * decision `UploadsService.linkForOrder` makes about re-issuing, and for the
 * same reason — two live tokens for one purchase is how the wrong one gets
 * sent.
 */
export function extendGrant(now: Date = new Date()): {
  expiresAt: Date;
  downloadCount: number;
} {
  return {
    expiresAt: new Date(now.getTime() + GRANT_TTL_DAYS * DAY_MS),
    downloadCount: 0,
  };
}

/**
 * Whether the key the claimer is holding is the key the purchase was opened
 * with.
 *
 * Constant-time, because this is a capability check rather than a lookup: the
 * return page presents `orderId` (which travels to the bank and back, and is
 * therefore guessable-adjacent) together with an intent key that never left
 * the buyer's tab, and it is the second one that decides. A length mismatch
 * answers false without throwing — `timingSafeEqual` raises on unequal
 * lengths, which would turn a wrong guess into a distinguishable 500.
 */
export function intentMatches(
  recorded: string | null,
  candidate: string,
): boolean {
  if (!recorded) return false;
  const a = Buffer.from(recorded);
  const b = Buffer.from(candidate);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * The download capability a paid material's buyer gets, and the endpoint that
 * spends it.
 *
 * There is no order row behind a paid material — the `Payment` is the whole
 * record of the purchase — so a grant is what paying buys. It is minted when
 * the payment settles, extended when the same person buys the same material
 * again, and revoked when the money goes back (which
 * `PaymentsService.recomputeTargetMirror` does, in the transaction that takes
 * the payment out of `paid`).
 *
 * Claiming one from the return page is `FulfilmentService`'s, not this
 * service's: the claim answers for a group-C order too, and neither purchase
 * should have to know the other exists.
 */
@Injectable()
export class MaterialGrantsService {
  private readonly logger = new Logger(MaterialGrantsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Open (or re-open) the buyer's access to one material.
   *
   * Idempotent by the same unique index that enforces one grant per buyer per
   * material, so a redelivered callback extends the grant a second time rather
   * than minting a second token.
   */
  async issue(input: {
    materialId: string;
    payerEmail: string;
    paymentId: string;
  }): Promise<PurchaseNextStepDto> {
    const payerEmail = input.payerEmail.toLowerCase();
    const now = new Date();
    const existing = await this.prisma.materialGrant.findUnique({
      where: {
        materialId_payerEmail: { materialId: input.materialId, payerEmail },
      },
    });

    const grant = existing
      ? await this.prisma.materialGrant.update({
          where: { id: existing.id },
          data: { ...extendGrant(now), paymentId: input.paymentId },
        })
      : await this.prisma.materialGrant.create({
          data: {
            token: newToken(),
            materialId: input.materialId,
            payerEmail,
            expiresAt: new Date(now.getTime() + GRANT_TTL_DAYS * DAY_MS),
            maxDownloads: GRANT_MAX_DOWNLOADS,
            paymentId: input.paymentId,
          },
        });

    return toNextStep(grant);
  }

  /**
   * Spend one download and hand back the file on disk.
   *
   * The count goes up before the file is streamed, and conditionally: two tabs
   * pressing the link at the same moment both read nine and would both be the
   * tenth. `updateMany` scoped to the count we read makes the loser a no-op,
   * and a no-op here is the same 404 as an exhausted grant.
   */
  async fileForToken(
    token: string,
  ): Promise<{ path: string; fileName: string }> {
    const grant = await this.prisma.materialGrant.findUnique({
      where: { token },
      include: {
        material: { select: { fileKey: true, fileName: true, slug: true } },
      },
    });
    if (!grant || !grantUsable(grant) || !grant.material.fileKey) {
      throw new NotFoundException('material_download_not_found');
    }

    const { count } = await this.prisma.materialGrant.updateMany({
      where: { id: grant.id, downloadCount: grant.downloadCount },
      data: { downloadCount: { increment: 1 }, lastDownloadAt: new Date() },
    });
    if (count === 0) throw new NotFoundException('material_download_not_found');

    // A row whose file is gone is a real state — a volume restored without its
    // files, a key edited by hand. Say the same 404 rather than letting
    // `res.download` fail into a 500.
    const path = this.storage.privateDocPath(grant.material.fileKey);
    try {
      await stat(path);
    } catch {
      throw new NotFoundException('material_download_not_found');
    }

    // The slug, not the buyer: this line says which material was downloaded
    // and how often, and nothing about who.
    this.logger.log(
      `material download ${grant.material.slug} (${grant.downloadCount + 1}/${grant.maxDownloads})`,
    );
    return {
      path,
      fileName: grant.material.fileName ?? `${grant.material.slug}.pdf`,
    };
  }

  /**
   * The link for a grant the back office is handing over by hand.
   *
   * The one recourse a buyer who lost the return-page link has: with no SMTP
   * the receipt does not reach them either, so they write in and the doctor
   * copies the link off the payment (open question 3). Which is why this
   * exists in this step rather than a later one.
   */
  async linkForPayment(paymentId: string): Promise<PurchaseNextStepDto | null> {
    const grant = await this.prisma.materialGrant.findFirst({
      where: { paymentId },
    });
    return grant ? toNextStep(grant) : null;
  }

  /**
   * Take a buyer's access back by hand.
   *
   * A refund already does this on its own, inside the transaction that moves
   * the payment out of `paid`, and that is the ordinary path. This is the one
   * that has no money in it: a link that went somewhere it should not have,
   * an address typed wrong, a purchase the doctor is settling another way.
   * Admin only, and audited, because it is a capability being destroyed.
   *
   * The row is deleted rather than flagged: what it held was permission, and
   * permission that has been withdrawn is not a record of anything. The
   * payment stays, which is the record of what was bought.
   */
  async revokeForPayment(paymentId: string, authorId: string): Promise<void> {
    const { count } = await this.prisma.materialGrant.deleteMany({
      where: { paymentId },
    });
    if (count === 0) throw new NotFoundException('material_grant_not_found');
    this.logger.log(
      `audit material.grant-revoked paymentId=${paymentId} userId=${authorId}`,
    );
  }

  /**
   * The same, but only while the grant still opens something.
   *
   * What the public return page is allowed to see. A grant that has expired or
   * run out of downloads is not a link to hand back — the back office's
   * lookup above still shows it, because an operator being told "expired, here
   * is the link anyway" is the point of that screen.
   */
  async liveLinkForPayment(
    paymentId: string,
  ): Promise<PurchaseNextStepDto | null> {
    const grant = await this.prisma.materialGrant.findFirst({
      where: { paymentId },
    });
    return grant && grantUsable(grant) ? toNextStep(grant) : null;
  }
}

function toNextStep(grant: {
  token: string;
  expiresAt: Date;
  maxDownloads: number;
  downloadCount: number;
}): PurchaseNextStepDto {
  return {
    kind: 'material_download',
    url: downloadUrl(grant.token),
    expiresAt: grant.expiresAt.toISOString(),
    downloadsLeft: Math.max(0, grant.maxDownloads - grant.downloadCount),
  };
}

/** 32 random bytes, URL-safe. Same shape and reasoning as `UploadLink.token`. */
function newToken(): string {
  return randomBytes(32).toString('base64url');
}

/**
 * The API's own origin, not the site's: this URL streams a file out of private
 * storage, so it is answered by the API directly rather than proxied through a
 * page that would have to hold the token to do it.
 */
function downloadUrl(token: string): string {
  return `${PUBLIC_API_URL}/materials/download/${token}`;
}
