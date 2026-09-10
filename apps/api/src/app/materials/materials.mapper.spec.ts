/**
 * A paid material's `fileUrl` is the paid material. It lives in the public
 * `/uploads` directory, so a storefront payload carrying it hands the file to
 * anyone who reads the JSON (audit A4, F1). Two mappers exist for this one
 * difference, which makes it exactly the difference worth pinning.
 */
import type { Material, MaterialCategory } from '../../generated/prisma/client';
import { toMaterialDto, toPublicMaterialDto } from './materials.mapper';

const MATERIAL: Material & { category: Pick<MaterialCategory, 'slug'> } = {
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
  fileName: 'ghid.pdf',
  sortOrder: 1,
  active: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-01T00:00:00.000Z'),
};

const paid = { ...MATERIAL, access: 'paid' as const, price: 12 };

describe('the storefront material payload', () => {
  it('carries the file of a free material', () => {
    expect(toPublicMaterialDto(MATERIAL).fileUrl).toBe(
      'http://localhost:3333/uploads/ghid.pdf',
    );
  });

  it('withholds the file of a paid material', () => {
    expect(toPublicMaterialDto(paid).fileUrl).toBeNull();
  });

  it('changes nothing else about a paid material', () => {
    expect(toPublicMaterialDto(paid)).toEqual({
      ...toMaterialDto(paid),
      fileUrl: null,
    });
  });

  it('leaves the back-office payload whole', () => {
    expect(toMaterialDto(paid).fileUrl).toBe(
      'http://localhost:3333/uploads/ghid.pdf',
    );
  });
});
