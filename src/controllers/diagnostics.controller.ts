import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller('diagnostics')
export class DiagnosticsController {
  constructor(private readonly dataSource: DataSource) {}

  // FK 강제가 실제로 ON 인지 증명: [{ foreign_keys: 1 }] 이어야 한다.
  @Get('foreign-keys')
  async foreignKeys() {
    const result = await this.dataSource.query('PRAGMA foreign_keys');
    return { pragma: result, enabled: result?.[0]?.foreign_keys === 1 };
  }
}
