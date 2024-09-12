// import {
//   Injectable,
//   CanActivate,
//   ExecutionContext,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Observable } from 'rxjs';
// import { Socket } from 'socket.io';
// import { ClerkClient, clerkClient } from '@clerk/clerk-sdk-node';

// @Injectable()
// export class WsAuthGuard implements CanActivate {
//   private clerk: ClerkClient;

//   constructor() {
//     this.clerk = clerkClient;
//   }

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const client: Socket = context.switchToWs().getClient<Socket>();
//     const token = client.handshake.headers.authorization?.split(' ')[1];

//     if (!token) {
//       throw new UnauthorizedException('Token missing');
//     }

//     try {
//       // todo modern verification
//       const session = await this.clerk.sessions.verifyToken(token);
//       const sessionValid = await this.clerk.sessions.verifySession(session.id);
//       const user = await this.clerk.users.getUser(session.userId);
//       if (!user) {
//         throw new UnauthorizedException('User does not exist');
//       }

//       // Attach user to the socket object
//       client.data.user = user;
//       return true;
//     } catch (err) {
//       throw new UnauthorizedException('Invalid token or user does not exist');
//     }
//   }
// }
