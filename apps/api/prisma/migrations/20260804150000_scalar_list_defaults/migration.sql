-- Give the other two scalar-list columns the same empty-array default that
-- `Post.ageKeys` needed. Neither holds a NULL today — every row was written
-- through Prisma, which always sends a value — but the column allowed one, and
-- a NULL scalar list reads back as `undefined`, which makes the field vanish
-- from the API response instead of arriving empty. Cheap to close, and the
-- Post case proved it is not theoretical.

-- AlterTable
ALTER TABLE "Material" ALTER COLUMN "ageKeys" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "QuickQuestion" ALTER COLUMN "attachments" SET DEFAULT ARRAY[]::TEXT[];
