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

    await this.db
      .backup(`backup-${Date.now()}.sqlite`)
      .then(() => {
        console.log('backup complete!');
      })
      .catch((err) => {
        console.log('backup failed:', err);
      })
      .finally(() => {
        this.flag = false;
      });
  }

  private get db(): Database.Database {
    const driver = this.dataSource.driver as BetterSqlite3Driver;
    return driver.databaseConnection as Database.Database;
  }
}
