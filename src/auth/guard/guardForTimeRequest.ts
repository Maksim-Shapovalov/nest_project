// import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
// import { Injectable } from '@nestjs/common';
//
// @Injectable()
// export class ThrottlerBehindProxyGuard extends ThrottlerGuard {
//   protected async getTracker(req: Record<string, any>): Promise<string> {
//     ThrottlerModule.forRoot({
//       ttl: 10,
//       limit: 5,
//     }),
//   }
//
// }
