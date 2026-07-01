import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { PostRepository } from 'src/repositories/post.repository';

interface CreatePostDto {
  userId: number;
  title: string;
}

@Controller('posts')
export class PostController {
  constructor(private readonly postRepository: PostRepository) {}

  // 정상 FK 참조로 Post 생성.
  @Post()
  create(@Body() dto: CreatePostDto) {
    const post = this.postRepository.create({
      title: dto.title,
      user: { id: dto.userId },
    });
    return this.postRepository.save(post);
  }

  // 네거티브 테스트: 존재하지 않는 userId → FK 제약 위반이 실제로 거부되는지 증명.
  @Post('invalid')
  async createInvalid(@Body() body: { userId?: number }) {
    const userId = body?.userId ?? 999999;
    try {
      const post = this.postRepository.create({
        title: 'orphan-post',
        user: { id: userId },
      });
      const saved = await this.postRepository.save(post);
      // 여기 도달하면 FK가 강제되지 않은 것 → 불안정.
      return { ok: true, fkEnforced: false, saved };
    } catch (error) {
      return {
        ok: false,
        fkEnforced: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  @Get()
  findAll() {
    return this.postRepository.find({ relations: { user: true } });
  }

  // DB onDelete CASCADE 검증: Post 삭제 → Comment 연쇄 삭제.
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.postRepository.delete(id);
    return { deleted: result.affected ?? 0 };
  }
}
