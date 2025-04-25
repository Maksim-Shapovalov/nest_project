// import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
//
//
// export class registrationCommand {
//   constructor(public blogId: string) {}
// }
//
// @CommandHandler(registrationCommand)
// export class registrationCase implements ICommandHandler<registrationCommand> {
//   constructor(protected blogsSQLRepository: ) {}
//   async execute(command: registrationCommand): Promise<boolean> {
//     return await this.blogsSQLRepository.deleteBlogsById(command.blogId);
//   }
// }
