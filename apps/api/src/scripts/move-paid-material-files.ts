/**
 * One-off: move every paid material's PDF off the public `/uploads` route and
 * into private storage.
 *
 * Why it exists when it will probably move nothing: all four paid materials
 * have `fileUrl: null` today, so there is nothing exposed at the moment this
 * ships. The window it covers is the one between now and the deploy — the
 * client may upload a paid PDF through the old form on any afternoon, and the
 * fix is cheap now and expensive the week after.
 *
 * Dry-run unless `--apply` is passed. It prints what it would do, counts the
 * rows before and after, and refuses to finish if the two disagree.
 *
 *   pnpm --filter @olesia/api exec tsx src/scripts/move-paid-material-files.ts
 *   pnpm --filter @olesia/api exec tsx src/scripts/move-paid-material-files.ts --apply
 */
import { basename, join } from 'node:path';
import { copyFile, mkdir, rm, stat } from 'node:fs/promises';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client';
import {
  PRIVATE_STORAGE_DIR,
  STORAGE_DIR,
  STORAGE_URL_PREFIX,
} from '../app/storage/storage.constants';

const apply = process.argv.includes('--apply');
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL ?? '' }),
});

async function main(): Promise<void> {
  const candidates = await prisma.material.findMany({
    where: { access: 'paid', fileUrl: { not: null } },
    select: { id: true, slug: true, fileUrl: true, fileKey: true },
  });

  const before = candidates.length;
  console.log(
    `${before} paid material(s) still carry a public fileUrl.` +
      (apply ? '' : ' Dry run: pass --apply to move them.'),
  );
  if (before === 0) return;

  await mkdir(PRIVATE_STORAGE_DIR, { recursive: true });

  let moved = 0;
  for (const material of candidates) {
    // The URL is `${PUBLIC_API_URL}/uploads/<uuid>.<ext>`; only the last
    // segment is ours to trust, and `basename` is also what keeps a crafted
    // path out of the filesystem.
    const key = basename(new URL(material.fileUrl!).pathname);
    if (!new URL(material.fileUrl!).pathname.startsWith(STORAGE_URL_PREFIX)) {
      console.warn(
        `  ${material.slug}: ${material.fileUrl} is not ours, skipped`,
      );
      continue;
    }

    const from = join(STORAGE_DIR, key);
    try {
      await stat(from);
    } catch {
      // The row points at a file that is not there. Clear the URL anyway: a
      // dead public link is not something to preserve, and the storefront
      // renders a material with no file honestly.
      console.warn(`  ${material.slug}: ${key} is missing on disk`);
      if (apply) {
        await prisma.material.update({
          where: { id: material.id },
          data: { fileUrl: null },
        });
      }
      continue;
    }

    console.log(`  ${material.slug}: ${key} → private storage`);
    if (!apply) continue;

    // Copy, then write the row, then unlink. In that order so a crash leaves
    // the file in both places rather than in neither.
    await copyFile(from, join(PRIVATE_STORAGE_DIR, key));
    await prisma.material.update({
      where: { id: material.id },
      data: { fileKey: key, fileUrl: null },
    });
    await rm(from, { force: true });
    moved += 1;
  }

  if (!apply) return;

  const after = await prisma.material.count({
    where: { access: 'paid', fileUrl: { not: null } },
  });
  console.log(
    `Moved ${moved}. Paid materials still carrying a fileUrl: ${after}.`,
  );
  if (after !== 0) {
    throw new Error(
      `${after} paid material(s) still have a public fileUrl after the move`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
