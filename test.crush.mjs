// 사용법:
//   node test.crush.mjs [header|page|truncate] [파일경로]
// 예:
//   node test.crush.mjs header db.sqlite
//   node test.crush.mjs page db.sqlite
//   node test.crush.mjs truncate db.sqlite

import fs from 'fs';
import path from 'path';

const mode = process.argv[2] || 'header';
const target = process.argv[3] || 'db.sqlite';
const filePath = path.resolve(process.cwd(), target);

if (!fs.existsSync(filePath)) {
  console.error(`파일 없음: ${filePath}`);
  process.exit(1);
}

const backupPath = `${filePath}.orig.bak`;
if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(filePath, backupPath);
  console.log(`원본 백업: ${backupPath}`);
}

const fd = fs.openSync(filePath, 'r+');
const size = fs.fstatSync(fd).size;

switch (mode) {
  case 'header': {
    // 첫 100바이트(SQLite 헤더) 파괴 -> SQLITE_NOTADB 유발
    const zeros = Buffer.alloc(100, 0);
    fs.writeSync(fd, zeros, 0, zeros.length, 0);
    console.log(`헤더 손상 완료 (0~100바이트): ${filePath}`);
    break;
  }
  case 'page': {
    // 파일 중간 페이지 손상 -> SQLITE_CORRUPT 유발
    const start = Math.floor(size / 2);
    const junk = Buffer.alloc(500, 0xff);
    fs.writeSync(fd, junk, 0, junk.length, start);
    console.log(`중간 페이지 손상 완료 (offset ${start}~${start + junk.length}): ${filePath}`);
    break;
  }
  case 'truncate': {
    // 파일 절반으로 자르기 -> SQLITE_CORRUPT / SQLITE_IOERR_SHORT_READ 유발
    const newSize = Math.floor(size / 2);
    fs.ftruncateSync(fd, newSize);
    console.log(`truncate 완료 (${size} -> ${newSize} bytes): ${filePath}`);
    break;
  }
  default:
    console.error(`알 수 없는 모드: ${mode} (header|page|truncate 중 선택)`);
    fs.closeSync(fd);
    process.exit(1);
}

fs.closeSync(fd);
