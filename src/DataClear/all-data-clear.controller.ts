import { injectable } from 'inversify';
import { Controller, Delete } from '@nestjs/common';

import { AllDataClearRepo } from './AllDataClearRepo';

@injectable()
@Controller('')
export class AllDataClearController {
  constructor(protected allDataClearRepo: AllDataClearRepo) {}
  @Delete()
  async allDataClear() {
    return this.allDataClearRepo.dataClear();
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
