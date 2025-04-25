import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSQLTypeOrmRepository } from '../../infrastructure/Blogs.repo.TypeOrm';

export class DeleteBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdCase
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
  async execute(command: DeleteBlogByIdCommand): Promise<boolean> {
    return await this.blogsSQLRepository.deleteBlogsById(command.blogId);
  }
}
