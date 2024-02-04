export class VideoClass {
  constructor(
    public id: number,
    public title: string,
    public author: string,
    public canBeDownloaded: boolean,
    public minAgeRestriction: any,
    public createdAt: string,
    public publicationDate: string,
    public availableResolutions: Array<string>,
  ) {}
}

export enum AvailableResolutionsEnum {
  P144 = 'P144',
  P240 = 'P240',
  P360 = 'P360',
  P480 = 'P480',
  P720 = 'P720',
  P1080 = 'P1080',
  P1440 = 'P1440',
  P2160 = 'P2160',
}

export type VideoType = {
  id: number;
  title: string;
  author: string;
  canBeDownloaded: boolean;
  minAgeRestriction: any;
  createdAt: string;
  publicationDate: string;
  availableResolutions: Array<string>;
};
