import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  email: string;

  @Column({ default: '123' })
  password: string = '비번비번';

  @Column()
  meta: string = '또 뭐가 있지...';
}
