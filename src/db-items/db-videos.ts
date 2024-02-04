// import { Router } from 'express';
// import { HTTP_STATUS } from '../Index';
//
// export const dbVideos = {
//   videos: [
//     {
//       id: 1,
//       title: 'string',
//       author: 'string',
//       canBeDownloaded: true,
//       minAgeRestriction: null,
//       createdAt: new Date().toISOString(),
//       publicationDate: new Date().toISOString(),
//       availableResolutions: ['P144'],
//     },
//   ],
// };
//
// export const AllDataVideoClear = Router();
//
// AllDataVideoClear.delete('/', (req: Request, res: Response) => {
//   dbVideos.videos = [];
//   return res.sendStatus(HTTP_STATUS.NO_CONTENT_204);
// });
