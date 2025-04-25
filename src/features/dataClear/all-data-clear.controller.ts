import { Controller, Delete, HttpCode } from '@nestjs/common';

import { AllDataClearRepo } from './AllDataClearRepo';

@Controller('testing')
export class AllDataClearController {
  constructor(protected allDataClearRepo: AllDataClearRepo) {}
  @Delete('all-data')
  @HttpCode(204)
  async allDataClear() {
    console.log('Clearing data...');
    await this.allDataClearRepo.dataClear();
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
