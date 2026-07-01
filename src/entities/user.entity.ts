import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from './post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: '123' })
  password: string;

  @Column()
  meta: string = '또 뭐가 있지...';

  // ORM 레벨: User 저장 시 중첩 posts 동시 insert + 조회 시 자동 로딩.
  @OneToMany(() => Post, (post) => post.user, {
    cascade: true,
    eager: true,
  })
  posts: Post[];
}
