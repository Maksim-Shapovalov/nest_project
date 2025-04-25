import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class isMongoIdPipe implements PipeTransform {
  transform(value: any) {
    try {
      return new ObjectId(value);
    } catch (e) {
      throw new BadRequestException('id is not valid');
    }
  }
}
