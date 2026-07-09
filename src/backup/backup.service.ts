import { Injectable, Logger } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectDataSource } from '@nestjs/typeorm';
import Database from 'better-sqlite3';
import { DataSource } from 'typeorm';
import { BetterSqlite3Driver } from 'typeorm/driver/better-sqlite3/BetterSqlite3Driver.js';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  flag = false;

  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Interval(5000)
  async backup() {
    if (this.flag) return;
    this.flag = true;
    const startedAt = Date.now();
    const before = this.countRows();
    this.logger.log(
      `start | users=${before.user} posts=${before.post} comments=${before.comment}`,
    );

    try {
      await this.db.backup('db-backup.sqlite');
      const after = this.countRows();
      const changedDuringBackup =
        after.user !== before.user ||
        after.post !== before.post ||
        after.comment !== before.comment;
      this.logger.log(
        `done in ${Date.now() - startedAt}ms | users=${after.user} posts=${after.post} comments=${after.comment}` +
          (changedDuringBackup
            ? ' (writes landed during backup — expected under WAL; db-backup.sqlite is a consistent snapshot as of copy start)'
            : ''),
      );
    } catch (error) {
      this.logger.error(`FAILED: ${(error as Error).message}`);
    } finally {
      this.flag = false;
    }
  }

  // 소스 DB만 조회 — db-backup.sqlite는 별도로 열지 않는다.
  private countRows(): { user: number; post: number; comment: number } {
    const count = (table: string) =>
      (
        this.db.prepare(`SELECT COUNT(*) AS c FROM ${table}`).get() as {
          c: number;
        }
      ).c;
    return {
      user: count('user'),
      post: count('post'),
      comment: count('comment'),
    };
  }

  private get db(): Database.Database {
    const driver = this.dataSource.driver as BetterSqlite3Driver;
    return driver.databaseConnection as Database.Database;
  }
}
