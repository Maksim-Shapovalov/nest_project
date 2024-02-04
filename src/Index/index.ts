import * as dotenv from 'dotenv';
import { app } from './initApp';
import { runDB } from '../DB/data-base';

dotenv.config();

const port = process.env.PORT || 3000;

console.log(port);

export const HTTP_STATUS = {
  OK_200: 200,
  CREATED_201: 201,
  NO_CONTENT_204: 204,
  BAD_REQUEST_400: 400,
  UNAUTHORIZED_401: 401,
  Forbidden_403: 403,
  NOT_FOUND_404: 404,
  TOO_MANY_REQUESTS_429: 429,
};

const startApp = async () => {
  await runDB();
  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
  });
};
startApp();
