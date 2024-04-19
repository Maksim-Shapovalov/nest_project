import { BadRequestException, Injectable } from '@nestjs/common';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../Blogs/Blogs.repository';

@ValidatorConstraint({ name: 'blogId', async: true })
@Injectable()
export class CustomBlogIdValidation implements ValidatorConstraintInterface {
  constructor(private blogRepository: BlogsRepository) {}

  async validate(blogId: string): Promise<boolean> {
    const blog = await this.blogRepository.getBlogsById(blogId);
    console.log(blog);
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
