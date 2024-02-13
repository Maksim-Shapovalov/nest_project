import { injectable } from 'inversify';
import { Controller, Delete, HttpCode } from '@nestjs/common';

import { AllDataClearRepo } from './AllDataClearRepo';

@injectable()
@Controller('testing/all-data')
export class AllDataClearController {
  constructor(protected allDataClearRepo: AllDataClearRepo) {}
  @Delete()
  @HttpCode(204)
  async allDataClear() {
    await this.allDataClearRepo.dataClear();
    return HttpCode(204);
  }
}

// @Controller('testing/all-data');
// AllDataClearController.delete('/', async (req: Request, res: Response) => {
//   await Promise.all([
//     PostModelClass.deleteMany({}),
//     BlogModelClass.deleteMany({}),
//     UserSchema.deleteMany({}),
//     CommentsModelClass.deleteMany({}),
//     DataIDModelClass.deleteMany({}),
//     PostLikesModelClass.deleteMany({}),
//   ]);
//   return res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
// });
