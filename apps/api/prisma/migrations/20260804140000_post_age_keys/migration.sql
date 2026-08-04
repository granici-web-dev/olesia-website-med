-- AlterTable
--
-- NOT NULL DEFAULT rather than Prisma's bare `TEXT[]`: articles written before
-- age tagging existed would otherwise hold NULL, and Prisma models a scalar
-- list as non-nullable — a NULL column comes back as `undefined`, the key
-- disappears from the JSON, and the public age filter calls .flatMap on
-- nothing. Caught on the seeded article before this shipped.
ALTER TABLE "Post" ADD COLUMN     "ageKeys" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
