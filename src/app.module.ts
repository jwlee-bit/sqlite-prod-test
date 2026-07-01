import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommentController } from './controllers/comment.controller';
import { DiagnosticsController } from './controllers/diagnostics.controller';
import { PostController } from './controllers/post.controller';
import { UserController } from './controllers/user.controller';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';
import { CommentRepository } from './repositories/comment.repository';
import { PostRepository } from './repositories/post.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3',
        database: 'db.sqlite',
        enableWAL: false,
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        logging: true,
        synchronize: true,
      }),
      dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return Promise.resolve(
          addTransactionalDataSource(new DataSource(options)),
        );
      },
    }),
    TypeOrmModule.forFeature([User, Post, Comment]),
  ],
  controllers: [
    AppController,
    UserController,
    PostController,
    CommentController,
    DiagnosticsController,
  ],
  providers: [AppService, UserRepository, PostRepository, CommentRepository],
})
export class AppModule {}
