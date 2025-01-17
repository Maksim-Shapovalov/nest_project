import { Injectable } from '@nestjs/common';
import { BlogsSQLTypeOrmRepository } from '../TypeOrm/Blogs.repo.TypeOrm';

@Injectable()
export class SuperAdminBlogService {
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
}
