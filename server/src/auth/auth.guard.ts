import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { verifyToken } from '@clerk/backend'; // Correct import for backend verification

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) throw new UnauthorizedException('No token provided');

    try {
      // 1. Verify Token with Clerk
      const verifiedToken = await verifyToken(token, {
        secretKey: process.env.CLERK_SECRET_KEY,
      });

      const clerkId = verifiedToken.sub; // The user's Clerk ID (e.g., user_2rgb...)

      // 2. Find User in OUR Database
      let user = await this.prisma.user.findUnique({
        where: { clerkId },
      });

      // 3. Lazy Sync: If user is new, create them!
      // 3. Lazy Sync: If user is new, create them WITH categories!
      if (!user) {
        console.log(`👤 New user detected (${clerkId}). Creating in DB...`);

        user = await this.prisma.user.create({
          data: {
            clerkId,
            email: `temp_${clerkId}@xaccapital.com`,
            // 👇 Create the Default "Welcome Pack"
            categories: {
              create: [
                {
                  name: 'Salary',
                  type: 'INCOME',
                  color: '#10b981',
                  icon: 'wallet',
                },
                {
                  name: 'Side Hustle',
                  type: 'INCOME',
                  color: '#34d399',
                  icon: 'briefcase',
                },
                {
                  name: 'Housing',
                  type: 'EXPENSE',
                  color: '#f43f5e',
                  icon: 'home',
                },
                {
                  name: 'Food',
                  type: 'EXPENSE',
                  color: '#f59e0b',
                  icon: 'utensils',
                },
                {
                  name: 'Transport',
                  type: 'EXPENSE',
                  color: '#3b82f6',
                  icon: 'car',
                },
                {
                  name: 'Shopping',
                  type: 'EXPENSE',
                  color: '#ec4899',
                  icon: 'shopping-bag',
                },
                {
                  name: 'Entertainment',
                  type: 'EXPENSE',
                  color: '#8b5cf6',
                  icon: 'tv',
                },
                {
                  name: 'Investments',
                  type: 'EXPENSE',
                  color: '#0ea5e9',
                  icon: 'trending-up',
                },
                {
                  name: 'Other',
                  type: 'EXPENSE',
                  color: '#94a3b8',
                  icon: 'more-horizontal',
                },
              ],
            },
          },
        });
        console.log(`✅ User ${user.id} created with default categories.`);
      }

      // 4. Attach the Database UUID to the request
      request.user = user;

      return true;
    } catch (err) {
      console.log('Auth Error:', err);
      throw new UnauthorizedException('Invalid Token');
    }
  }
}
