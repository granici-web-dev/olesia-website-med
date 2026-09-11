import { randomUUID } from 'node:crypto';
import { readFile, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { PRIVATE_STORAGE_DIR } from '../storage/storage.constants';
import { CheckResult, readBackupStatus } from './backup-status';

export type HealthReport = {
  status: 'ok' | 'fail';
  timestamp: string;
  checks: {
    db: CheckResult;
    storage: CheckResult;
    backup: CheckResult;
  };
};

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async report(): Promise<HealthReport> {
    const [db, storage, backup] = await Promise.all([
      this.checkDatabase(),
      this.checkPrivateStorage(),
      this.checkBackup(),
    ]);

    const checks = { db, storage, backup };
    const failed = Object.values(checks).some((result) => result === 'fail');

    return {
      status: failed ? 'fail' : 'ok',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  /**
   * The probe used to be `return { status: 'ok' }`, so a container whose
   * Postgres had died reported itself healthy (audit A11, H2). One round trip
   * to the database is the difference between "the process is running" and
   * "the API can answer a request".
   */
  private async checkDatabase(): Promise<CheckResult> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'pass';
    } catch {
      return 'fail';
    }
  }

  /**
   * Patient documents are written to a mounted volume, and a volume that has
   * gone read-only or filled up fails every upload while every page still
   * renders. Write a byte and remove it: the public uploads directory would
   * do as well, but this one is the volume whose failure loses medical files.
   */
  private async checkPrivateStorage(): Promise<CheckResult> {
    const probe = join(PRIVATE_STORAGE_DIR, `.health-${randomUUID()}`);
    try {
      await writeFile(probe, '');
      await unlink(probe);
      return 'pass';
    } catch {
      return 'fail';
    }
  }

  /**
   * The backup container writes `last-run.json` after every run; the API
   * mounts that volume read-only and reads nothing else from it.
   *
   * A missing file is a pass, and that is a deliberate hole: the first
   * deployment has no backup yet, and a health endpoint that answers 503 from
   * the moment the stack comes up until 03:00 the next morning is one nobody
   * will believe. Runbook step 11 runs `backup.sh` by hand on the day of the
   * deploy, and from then on the file exists and its age is watched.
   */
  private async checkBackup(): Promise<CheckResult> {
    const statusFile = process.env.BACKUP_STATUS_FILE;
    if (!statusFile) return 'pass';

    let raw: string;
    try {
      raw = await readFile(statusFile, 'utf8');
    } catch (error) {
      // Absent means no backup has run here yet. Anything else — a volume that
      // stopped being mounted, a file this process may not read — is a status
      // nobody can vouch for, and must not read as a pass.
      const missing =
        error instanceof Error && 'code' in error && error.code === 'ENOENT';
      return missing ? 'pass' : 'fail';
    }

    return readBackupStatus(raw, new Date());
  }
}
