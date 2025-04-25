import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogRequest } from '../../domain/Blogs.type';
import { BlogsSQLTypeOrmRepository } from '../../infrastructure/Blogs.repo.TypeOrm';

export class UpdatePostsByIdInBlogCommand {
  constructor(
    public blogId: string,
    public blogUpdateModel: BlogRequest,
  ) {}
}

@CommandHandler(UpdatePostsByIdInBlogCommand)
export class UpdatePostsByIdInBlogCase
  implements ICommandHandler<UpdatePostsByIdInBlogCommand>
{
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
  async execute(command: UpdatePostsByIdInBlogCommand): Promise<boolean> {
    const blogs = {
      id: command.blogId,
      name: command.blogUpdateModel.name,
      description: command.blogUpdateModel.description,
      websiteUrl: command.blogUpdateModel.websiteUrl,
    };
    return await this.blogsSQLRepository.updateBlogById(blogs);
  }
}
