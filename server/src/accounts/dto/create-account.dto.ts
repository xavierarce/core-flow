import { AccountType } from '@prisma/client';

export class CreateAccountDto {
  name: string;
  institution: string;
  balance: number;
  type: AccountType;
  currency?: string;
}
