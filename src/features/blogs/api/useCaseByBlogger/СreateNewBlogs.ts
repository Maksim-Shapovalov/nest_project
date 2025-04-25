import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsPostgresTypeOrmRepository } from '../../../post/infrastrucrue/Posts.repo.TypeOrm';
import {
  BlogClass,
  BlogRequest,
  BlogsOutputModel,
} from '../../domain/Blogs.type';
import { NewestPostLike } from '../../../users/domain/User.type';
import { BlogsSQLTypeOrmRepository } from '../../infrastructure/Blogs.repo.TypeOrm';

export class CreateNewBlogsCommand {
  constructor(
    public blogInputModel: BlogRequest,
    public userModel: NewestPostLike,
  ) {}
}

@CommandHandler(CreateNewBlogsCommand)
export class CreateNewBlogsCase
  implements ICommandHandler<CreateNewBlogsCommand>
{
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
  async execute(command: CreateNewBlogsCommand): Promise<BlogsOutputModel> {
    const newBlogs = new BlogClass(
      command.blogInputModel.name,
      command.blogInputModel.description,
      command.blogInputModel.websiteUrl,
      command.userModel.userId,
      new Date().toISOString(),
      false,
    );

    return this.blogsSQLRepository.saveBlog(newBlogs);
  }
}
