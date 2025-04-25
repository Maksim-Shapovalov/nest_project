import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsSQLTypeOrmRepository } from '../../infrastructure/Blogs.repo.TypeOrm';

export class DeletePostInBlogByIdCommand {
  constructor(
    public blogId: string,
    public postId: string,
  ) {}
}

@CommandHandler(DeletePostInBlogByIdCommand)
export class DeletePostInBlogByIdCase
  implements ICommandHandler<DeletePostInBlogByIdCommand>
{
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
  async execute(command: DeletePostInBlogByIdCommand): Promise<boolean> {
    return await this.blogsSQLRepository.deletePostInBlogById(
      command.blogId,
      command.postId,
    );
  }
}
