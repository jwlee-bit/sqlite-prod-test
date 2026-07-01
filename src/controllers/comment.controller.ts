import { Controller, Get } from '@nestjs/common';
import { CommentRepository } from 'src/repositories/comment.repository';

@Controller('comments')
export class CommentController {
  constructor(private readonly commentRepository: CommentRepository) {}

  // 삭제 후 잔존/연쇄삭제 결과 확인용.
  @Get()
  async findAll() {
    const [items, count] = await this.commentRepository.findAndCount({
      relations: { post: true },
    });
    return { count, items };
  }
}
