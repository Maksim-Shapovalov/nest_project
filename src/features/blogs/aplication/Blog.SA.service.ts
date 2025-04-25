import { Injectable } from '@nestjs/common';
import { BlogsSQLTypeOrmRepository } from '../infrastructure/Blogs.repo.TypeOrm';

@Injectable()
export class SuperAdminBlogService {
  constructor(protected blogsSQLRepository: BlogsSQLTypeOrmRepository) {}
}
