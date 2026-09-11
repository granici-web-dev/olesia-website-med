/**
 * What the storefront is allowed to know about a material.
 *
 * This file used to pin one difference: a paid material's `fileUrl` was
 * withheld, because the paid PDFs sat in the public `/uploads` directory and
 * the URL *was* the file (audit A4, F1). The file has moved to private storage
 * since, so there are now two columns and the payload must carry neither for a
 * paid material — `fileUrl` because it is not where the file is any more, and
 * `fileKey` because a storefront has no use for a storage key. What replaces
 * both is `hasFile`, which decides whether a card sells or says "în curând",
 * and getting *that* wrong sells a download nobody can deliver.
 */
import type { Material, MaterialCategory } from '../../generated/prisma/client';
import { toMaterialDto, toPublicMaterialDto } from './materials.mapper';

const FREE: Material & { category: Pick<MaterialCategory, 'slug'> } = {
  id: 'b8a0f0e6-0000-4000-8000-000000000001',
  slug: 'ghid-diversificare',
  categoryId: 'b8a0f0e6-0000-4000-8000-000000000002',
  category: { slug: 'alimentatie' },
  ageKeys: ['6-12m'],
  titleRo: 'Ghid de diversificare',
  titleEn: 'Weaning guide',
  titleRu: null,
  descriptionRo: 'Descriere',
  descriptionEn: 'Description',
  descriptionRu: null,
  pageCount: 16,
  fileLang: 'RO',
  access: 'free',
  price: null,
  flags: [],
  fileUrl: 'http://localhost:3333/uploads/ghid.pdf',
  fileKey: null,
  fileName: 'ghid.pdf',
  sortOrder: 1,
  active: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const paid = {
  ...FREE,
  access: 'paid' as const,
  price: 12,
  fileUrl: null,
  fileKey: 'b8a0f0e6-0000-4000-8000-000000000003.pdf',
};

describe('the storefront material payload', () => {
  it('carries the file of a free material', () => {
    expect(toPublicMaterialDto(FREE).fileUrl).toBe(
      'http://localhost:3333/uploads/ghid.pdf',
    );
  });

  it('never carries the storage key of a paid material', () => {
    expect(toPublicMaterialDto(paid)).not.toHaveProperty('fileKey');
  });

  it('withholds a public URL left on a paid material by an older row', () => {
    expect(
      toPublicMaterialDto({
        ...paid,
        fileUrl: 'http://localhost:3333/uploads/ghid.pdf',
      }).fileUrl,
    ).toBeNull();
  });

  it('says a paid material with a private file is ready to sell', () => {
    expect(toPublicMaterialDto(paid).hasFile).toBe(true);
  });

  it('says a paid material with no file yet is not', () => {
    expect(toPublicMaterialDto({ ...paid, fileKey: null }).hasFile).toBe(false);
  });

  it('does not count a public URL as a paid material having a file', () => {
    expect(
      toPublicMaterialDto({
        ...paid,
        fileKey: null,
        fileUrl: 'http://localhost:3333/uploads/ghid.pdf',
      }).hasFile,
    ).toBe(false);
  });

  it('says a free material with a URL has a file, and one without does not', () => {
    expect(toPublicMaterialDto(FREE).hasFile).toBe(true);
    expect(toPublicMaterialDto({ ...FREE, fileUrl: null }).hasFile).toBe(false);
  });

  it('changes nothing else about a paid material', () => {
    const { fileKey, ...expected } = toMaterialDto(paid);
    expect(toPublicMaterialDto(paid)).toEqual({ ...expected, hasFile: true });
  });

  it('leaves the back-office payload whole, key included', () => {
    expect(toMaterialDto(paid).fileKey).toBe(
      'b8a0f0e6-0000-4000-8000-000000000003.pdf',
    );
  });
});
