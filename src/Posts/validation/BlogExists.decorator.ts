import { Injectable } from '@nestjs/common';

import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { BlogsRepository } from '../../Blogs/Blogs.repository';

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class CustomBlogIdValidation implements ValidatorConstraintInterface {
  constructor(private readonly blogRepository: BlogsRepository) {}

  async validate(id: string): Promise<boolean> {
    const blog = await this.blogRepository.getBlogsById(id);
    if (!blog) {
      throw new Error();
    }
    return true;
  }
}
