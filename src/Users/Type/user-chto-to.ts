import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ObjectId } from 'mongodb';

@Injectable()
export class isMongoIdPipe implements PipeTransform {
  transform(value: any) {
    try {
      const param = new ObjectId(value);
      return param;
    } catch (e) {
      throw new BadRequestException('id is not valid');
    }
  }
}
