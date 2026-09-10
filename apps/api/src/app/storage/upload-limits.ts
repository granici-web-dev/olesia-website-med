/**
 * Busboy limits for a multipart route.
 *
 * Every size check in `StorageService` runs on `file.size`, which exists only
 * once multer has read the whole part into memory. Without a ceiling on the
 * parser itself, a single unauthenticated request decides how much of the
 * API's RAM it gets. These are that ceiling; the service's own checks stay as
 * the second one.
 */
export function uploadLimits(
  fileSize: number,
  /** Raised only where a route legitimately carries a long text field. */
  fieldSize = 2_000,
) {
  return {
    limits: {
      fileSize,
      files: 1,
      fields: 4,
      fieldNameSize: 100,
      fieldSize,
    },
  };
}
