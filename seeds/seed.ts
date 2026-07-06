import { Like } from 'typeorm';
import { Comment } from '../src/entities/comment.entity';
import { Post } from '../src/entities/post.entity';
import { User } from '../src/entities/user.entity';
import {
  SEED_TITLE_PREFIX,
  SEED_USERNAME_PREFIX,
  createSeedDataSource,
} from './seed-data-source';

// 환경변수로 규모 조절 가능: SEED_USERS=200 npm run seed
const USER_COUNT = Number(process.env.SEED_USERS ?? 100);
const POSTS_PER_USER = Number(process.env.SEED_POSTS_PER_USER ?? 10);
const COMMENTS_PER_POST = Number(process.env.SEED_COMMENTS_PER_POST ?? 5);

// SQLite 바인딩 파라미터 한도를 넘지 않도록 나눠서 insert
const CHUNK_SIZE = 500;

function chunk<T>(rows: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < rows.length; i += size) {
    chunks.push(rows.slice(i, i + size));
  }
  return chunks;
}

async function main() {
  const dataSource = await createSeedDataSource().initialize();

  try {
    const existing = await dataSource.getRepository(User).countBy({
      username: Like(`${SEED_USERNAME_PREFIX}%`),
    });
    if (existing > 0) {
      console.error(
        `[seed] 이미 시드 유저 ${existing}명이 존재합니다. 먼저 "npm run seed:undo"로 삭제한 뒤 다시 실행하세요.`,
      );
      process.exitCode = 1;
      return;
    }

    await dataSource.transaction(async (manager) => {
      // 1) User 삽입
      const userRows = Array.from({ length: USER_COUNT }, (_, i) => ({
        username: `${SEED_USERNAME_PREFIX}${i + 1}`,
        email: `${SEED_USERNAME_PREFIX}${i + 1}@seed.local`,
        password: '123',
        meta: 'seed 데이터입니다',
      }));
      for (const rows of chunk(userRows, CHUNK_SIZE)) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(User)
          .values(rows)
          .execute();
      }

      const users: Array<{ id: number }> = await manager
        .createQueryBuilder(User, 'u')
        .select('u.id', 'id')
        .where('u.username LIKE :prefix', {
          prefix: `${SEED_USERNAME_PREFIX}%`,
        })
        .getRawMany();

      // 2) Post 삽입
      const postRows = users.flatMap((user) =>
        Array.from({ length: POSTS_PER_USER }, (_, i) => ({
          title: `${SEED_TITLE_PREFIX}user ${user.id}의 ${i + 1}번째 글`,
          user: { id: user.id },
        })),
      );
      for (const rows of chunk(postRows, CHUNK_SIZE)) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Post)
          .values(rows)
          .execute();
      }

      const posts: Array<{ id: number }> = await manager
        .createQueryBuilder(Post, 'p')
        .select('p.id', 'id')
        .where('p.title LIKE :prefix', { prefix: `${SEED_TITLE_PREFIX}%` })
        .getRawMany();

      // 3) Comment 삽입
      const commentRows = posts.flatMap((post) =>
        Array.from({ length: COMMENTS_PER_POST }, (_, i) => ({
          content: `${SEED_TITLE_PREFIX}post ${post.id}의 ${i + 1}번째 댓글`,
          post: { id: post.id },
        })),
      );
      for (const rows of chunk(commentRows, CHUNK_SIZE)) {
        await manager
          .createQueryBuilder()
          .insert()
          .into(Comment)
          .values(rows)
          .execute();
      }

      console.log(
        `[seed] 완료: user ${users.length}건, post ${posts.length}건, comment ${commentRows.length}건 삽입`,
      );
    });
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('[seed] 실패:', err);
  process.exit(1);
});
