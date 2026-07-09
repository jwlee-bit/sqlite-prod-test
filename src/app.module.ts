import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BackupModule } from './backup/backup.module';
import { CommentController } from './controllers/comment.controller';
import { DiagnosticsController } from './controllers/diagnostics.controller';
import { PostController } from './controllers/post.controller';
import { UserController } from './controllers/user.controller';
import { Comment } from './entities/comment.entity';
import { Post } from './entities/post.entity';
import { User } from './entities/user.entity';
import { ModuleResolverModule } from './module-resolver/module-resolver.module';
import { CommentRepository } from './repositories/comment.repository';
import { PostRepository } from './repositories/post.repository';
import { UserRepository } from './repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'better-sqlite3',
        database: 'db.sqlite',
        enableWAL: true,
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        // logging: true,
        synchronize: true,
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        const dataSource = await new DataSource(options).initialize();
        const rows = await dataSource.query<Array<{ foreign_keys: number }>>(
          'PRAGMA foreign_keys',
        );
        console.log(
          '[startup] foreign_keys =',
          rows[0]?.foreign_keys ? 'ON!' : 'OFF',
        );

        return addTransactionalDataSource(dataSource);
      },
    }),
    TypeOrmModule.forFeature([User, Post, Comment]),
    BackupModule,
    ModuleResolverModule,
  ],
  controllers: [
    AppController,
    PostController,
    UserController,
    CommentController,
    DiagnosticsController,
  ],
  providers: [AppService, UserRepository, PostRepository, CommentRepository],
})
export class AppModule {}
