import {
  SEED_USERNAME_PREFIX,
  createSeedDataSource,
} from './seed-data-source';

// 시드 유저(seed_user_%)를 기준으로, 그에 딸린 post/comment까지만 삭제한다.
// FK CASCADE(PRAGMA foreign_keys)에 의존하지 않도록 자식 → 부모 순으로 직접 지운다.
async function main() {
  const dataSource = await createSeedDataSource().initialize();

  try {
    await dataSource.transaction(async (manager) => {
      const pattern = `${SEED_USERNAME_PREFIX}%`;

      const [{ cnt: commentCount }] = await manager.query(
        `SELECT COUNT(*) AS cnt FROM "comment"
         WHERE post_id IN (
           SELECT id FROM "post" WHERE user_id IN (
             SELECT id FROM "user" WHERE username LIKE ?))`,
        [pattern],
      );
      const [{ cnt: postCount }] = await manager.query(
        `SELECT COUNT(*) AS cnt FROM "post"
         WHERE user_id IN (SELECT id FROM "user" WHERE username LIKE ?)`,
        [pattern],
      );
      const [{ cnt: userCount }] = await manager.query(
        `SELECT COUNT(*) AS cnt FROM "user" WHERE username LIKE ?`,
        [pattern],
      );

      if (userCount === 0) {
        console.log('[seed:undo] 삭제할 시드 데이터가 없습니다.');
        return;
      }

      await manager.query(
        `DELETE FROM "comment"
         WHERE post_id IN (
           SELECT id FROM "post" WHERE user_id IN (
             SELECT id FROM "user" WHERE username LIKE ?))`,
        [pattern],
      );
      await manager.query(
        `DELETE FROM "post"
         WHERE user_id IN (SELECT id FROM "user" WHERE username LIKE ?)`,
        [pattern],
      );
      await manager.query(`DELETE FROM "user" WHERE username LIKE ?`, [
        pattern,
      ]);

      console.log(
        `[seed:undo] 완료: user ${userCount}건, post ${postCount}건, comment ${commentCount}건 삭제`,
      );
    });
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('[seed:undo] 실패:', err);
  process.exit(1);
});
