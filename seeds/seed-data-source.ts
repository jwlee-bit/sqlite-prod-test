import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { Comment } from '../src/entities/comment.entity';
import { Post } from '../src/entities/post.entity';
import { User } from '../src/entities/user.entity';

// 시드로 삽입된 행을 식별하기 위한 마커. 삭제(unseed) 시 이 접두어 기준으로만 지운다.
export const SEED_USERNAME_PREFIX = 'seed_user_';
export const SEED_TITLE_PREFIX = '[seed] ';

// app.module.ts 의 TypeORM 설정과 동일하게 맞춘 시드 전용 DataSource
export const createSeedDataSource = () =>
  new DataSource({
    type: 'better-sqlite3',
    database: 'db.sqlite',
    enableWAL: false,
    entities: [User, Post, Comment],
    namingStrategy: new SnakeNamingStrategy(),
    synchronize: true,
  });
