import { Injectable } from '@nestjs/common';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

import { BlogsSQLTypeOrmRepository } from '../../Blogs/TypeOrm/Blogs.repo.TypeOrm';

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class CustomBlogIdValidation implements ValidatorConstraintInterface {
  constructor(private blogRepository: BlogsSQLTypeOrmRepository) {}

  async validate(blogId: number): Promise<boolean> {
    const blog = await this.blogRepository.getBlogsById(blogId);
    if (!blog) {
      return false;
    }
    return true;
  }
}
/*
try {
      const blog = await this.blogRepository.getBlogsById(id);
      if (blog) return true;
    } catch (e) {
      throw new Error(e);
    }
 */
