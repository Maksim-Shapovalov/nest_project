import { UserRepository } from '../Users/User.repository';
import { UserService } from '../Users/User.service';
import { Container } from 'inversify';
import { UserController } from '../Users/User.controller';
import { AuthController } from '../Authentication/Auth.controller';
import { JwtService } from '../Token/jwt-service';
import { RefreshTokenRepo } from '../Token/refreshToken-repo';
import { DeletedTokenRepoRepository } from '../Token/deletedTokenRepo-repository';
import { SecurityDeviceService } from '../Device/SecurityDevice.service';
import { SecurityDevicesRepopository } from '../Device/SecurityDevices.repopository';
import { BlogsController } from '../Blogs/Blogs.controller';
import { BlogsService } from '../Blogs/Blogs.service';
import { PostsService } from '../Posts/Posts.service';
import { PostsRepository } from '../Posts/Posts.repository';
import { BlogsRepository } from '../Blogs/Blogs.repository';
import { CommentsController } from '../Comment/Comment.controller';
import { CommentsService } from '../Comment/Comments.service';
import { CommentsRepository } from '../Comment/Comments.repository';
import { DeviceController } from '../Device/SecurityDevice.controller';
import { PostsController } from '../Posts/Posts.controller';
import { AuthService } from '../Authentication/Auth.service';
import { EmailManager } from '../Email/email-manager';
import { EmailAdapter } from '../Email/email-adapter';

export const container = new Container();
container.bind(UserController).to(UserController);
container.bind(AuthController).to(AuthController);
container.bind(BlogsController).to(BlogsController);
container.bind(CommentsController).to(CommentsController);
container.bind(DeviceController).to(DeviceController);
container.bind(PostsController).to(PostsController);

container.bind<UserService>(UserService).to(UserService);
container
  .bind<SecurityDeviceService>(SecurityDeviceService)
  .to(SecurityDeviceService);
container.bind<JwtService>(JwtService).to(JwtService);
container.bind<BlogsService>(BlogsService).to(BlogsService);
container.bind<PostsService>(PostsService).to(PostsService);
container.bind<CommentsService>(CommentsService).to(CommentsService);
container.bind<AuthService>(AuthService).to(AuthService);

container.bind<UserRepository>(UserRepository).to(UserRepository);
container.bind<RefreshTokenRepo>(RefreshTokenRepo).to(RefreshTokenRepo);
container
  .bind<DeletedTokenRepoRepository>(DeletedTokenRepoRepository)
  .to(DeletedTokenRepoRepository);
container
  .bind<SecurityDevicesRepopository>(SecurityDevicesRepopository)
  .to(SecurityDevicesRepopository);
container.bind<PostsRepository>(PostsRepository).to(PostsRepository);
container.bind<BlogsRepository>(BlogsRepository).to(BlogsRepository);
container.bind<CommentsRepository>(CommentsRepository).to(CommentsRepository);
container.bind<EmailManager>(EmailManager).to(EmailManager);
container.bind<EmailAdapter>(EmailAdapter).to(EmailAdapter);
