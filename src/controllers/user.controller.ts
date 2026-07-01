import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';

interface CreateCommentDto {
  content: string;
}

interface CreatePostDto {
  title: string;
  comments?: CreateCommentDto[];
}

interface CreateUserDto {
  username: string;
  email: string;
  password?: string;
  posts?: CreatePostDto[];
}

@Controller('users')
export class UserController {
  constructor(private readonly userRepository: UserRepository) {}

  // ORM cascade insert 검증: 중첩 posts/comments가 한 번에 저장된다.
  @Post()
  create(@Body() dto: CreateUserDto) {
    const user = this.userRepository.create(dto);
    return this.userRepository.save(user);
  }

  @Get()
  findAll() {
    return this.userRepository.find();
  }

  // eager 로딩 검증: posts/comments가 자동으로 함께 반환된다.
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  // DB onDelete CASCADE 체인 검증: User 삭제 → Post → Comment 연쇄 삭제.
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userRepository.delete(id);
    return { deleted: result.affected ?? 0 };
  }
}
