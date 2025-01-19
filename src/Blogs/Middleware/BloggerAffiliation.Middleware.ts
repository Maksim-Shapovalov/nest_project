import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CustomUUIDValidation } from '../../Other/validator.validateUUID';
import { BlogsSQLTypeOrmRepository } from '../TypeOrm/Blogs.repo.TypeOrm';

@Injectable()
export class BloggerAffiliationMiddleware implements CanActivate {
  constructor(
    protected bloggerRepo: BlogsSQLTypeOrmRepository,
    private readonly customUUIDValidation: CustomUUIDValidation,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userModel = request.user.userId;
    const blogId = request.params.id;
    if (!blogId || !this.customUUIDValidation.validate(blogId))
      throw new BadRequestException();

    const findBlog = await this.bloggerRepo.getBlogForMiddleware(blogId);
    if (!findBlog) {
      throw new NotFoundException();
    } else if (findBlog.userId !== userModel) {
      throw new ForbiddenException();
    }
    return true;
  }
}
