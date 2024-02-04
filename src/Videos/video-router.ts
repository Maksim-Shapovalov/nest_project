// import { Request, Response, Router } from 'express';
//
// import { AvailableResolutionsEnum, VideoType } from './video-type';
// import { ValidationErrorType } from '../ErrorInfo/Error-validation';
// import { ValidationVideo } from './video-validation';
// import { HTTP_STATUS } from '../Index';
//
// export const VideoRouter = Router();
//
// VideoRouter.get('/', (req: Request, res: Response) => {
//   res.status(HTTP_STATUS.OK_200).send(dbVideos.videos);
// });
// VideoRouter.get('/:id', (req: Request, res: Response) => {
//   const video = dbVideos.videos.find((v) => v.id === +req.params.id);
//   console.log(video, 'get by id');
//   if (!video) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
//   res.status(HTTP_STATUS.OK_200).send(video);
// });
//
// VideoRouter.post('/', ValidationVideo(), (req: Request, res: Response) => {
//   const { availableResolutions } = req.body;
//   const newVideo: VideoType = {
//     id: +new Date(),
//     title: req.body.title,
//     author: req.body.author,
//     canBeDownloaded: false,
//     minAgeRestriction: null,
//     createdAt: new Date().toISOString(),
//     publicationDate: new Date(
//       new Date().setDate(new Date().getDate() + 1),
//     ).toISOString(),
//     availableResolutions: req.body.availableResolutions,
//     //new Date((nextDay.setDate(nextDay.getDate() + 1))).toISOString()
//   };
//   console.log(newVideo);
//   const errorsMessages: ValidationErrorType[] = [];
//   if (!newVideo.title || newVideo.title.length > 40) {
//     errorsMessages.push({
//       message: 'Incorrect title',
//       field: 'title',
//     });
//   }
//   if (!newVideo.author || newVideo.author.length > 20) {
//     errorsMessages.push({
//       message: 'Incorrect author',
//       field: 'author',
//     });
//   }
//   for (const resolution of availableResolutions) {
//     if (
//       !Object.values(AvailableResolutionsEnum).includes(resolution) ||
//       !newVideo.availableResolutions
//     ) {
//       errorsMessages.push({
//         message: 'Incorrect availableResolutions',
//         field: 'availableResolutions',
//       });
//     }
//   }
//   if (errorsMessages.length) {
//     return res.status(HTTP_STATUS.BAD_REQUEST_400).send({ errorsMessages });
//   } else {
//     dbVideos.videos.push(newVideo);
//     res.status(HTTP_STATUS.CREATED_201).send(newVideo);
//   }
// });
//
// VideoRouter.put(
//   '/:id',
//   // ValidationVideo(),
//   (req: Request, res: Response) => {
//     const video = dbVideos.videos.find((v) => v.id === +req.params.id);
//     if (!video) return res.sendStatus(HTTP_STATUS.NOT_FOUND_404);
//     const { availableResolutions } = req.body;
//
//     const errorsMessages: ValidationErrorType[] = [];
//
//     if (!req.body.title || req.body.title.length > 40) {
//       errorsMessages.push({
//         message: 'Incorrect title',
//         field: 'title',
//       });
//     }
//     if (!req.body.author || req.body.author.length > 20) {
//       errorsMessages.push({
//         message: 'Incorrect author',
//         field: 'author',
//       });
//     }
//     if (!req.body.availableResolutions) {
//       errorsMessages.push({
//         message: 'Incorrect availableResolutions',
//         field: 'availableResolutions',
//       });
//     }
//     for (const resolution of availableResolutions) {
//       if (!Object.values(AvailableResolutionsEnum).includes(resolution)) {
//         errorsMessages.push({
//           message: 'Incorrect availableResolutions',
//           field: 'availableResolutions',
//         });
//       }
//     }
//     if (
//       req.body.canBeDownloaded &&
//       typeof req.body.canBeDownloaded !== 'boolean'
//     ) {
//       errorsMessages.push({
//         message: 'Incorrect canBeDownloaded',
//         field: 'canBeDownloaded',
//       });
//     }
//     if (
//       !req.body.minAgeRestriction ||
//       typeof req.body.minAgeRestriction !== 'number' ||
//       1 > req.body.minAgeRestriction ||
//       req.body.minAgeRestriction > 18
//     ) {
//       errorsMessages.push({
//         message: 'Incorrect minAgeRestriction',
//         field: 'minAgeRestriction',
//       });
//     }
//     if (
//       !req.body.publicationDate ||
//       typeof req.body.publicationDate !== 'string' ||
//       !req.body.publicationDate.trim()
//     ) {
//       errorsMessages.push({
//         message: 'Incorrect publicationDate',
//         field: 'publicationDate',
//       });
//     }
//     if (errorsMessages.length) {
//       console.log(errorsMessages, 'errr');
//       return res.status(HTTP_STATUS.BAD_REQUEST_400).send({ errorsMessages });
//     } else {
//       video.title = req.body.title;
//       video.author = req.body.author;
//       video.availableResolutions = req.body.availableResolutions;
//       video.canBeDownloaded = req.body.canBeDownloaded;
//       video.minAgeRestriction = req.body.minAgeRestriction;
//       video.publicationDate = req.body.publicationDate;
//
//       res.status(HTTP_STATUS.NO_CONTENT_204).send(video);
//     }
//   },
// );
//
// VideoRouter.delete('/:id', (req: Request, res: Response) => {
//   for (let i = 0; i < dbVideos.videos.length; i++) {
//     if (dbVideos.videos[i].id === +req.params.id) {
//       dbVideos.videos.splice(i, 1);
//       return res.sendStatus(204);
//     }
//   }
//   return res.sendStatus(404);
// });
