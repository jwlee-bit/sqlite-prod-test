import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from './comment.entity';
import { User } from './user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // DB 레벨 FK: 부모(User) 삭제 시 SQLite가 이 행을 연쇄 삭제한다.
  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'CASCADE' })
  user: User;

  // ORM 레벨: Post 저장 시 중첩 comments 동시 insert + 조회 시 자동 로딩.
  @OneToMany(() => Comment, (comment) => comment.post, {
    cascade: true,
    eager: true,
  })
  comments: Comment[];
}
