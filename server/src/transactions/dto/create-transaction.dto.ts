import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class CreateTransactionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number; // e.g. -15.50

  @IsString()
  @IsNotEmpty()
  description: string; // e.g. "Cash Withdrawal"

  @IsString()
  @IsOptional()
  category?: string; // e.g. "Food"

  @IsUUID()
  @IsNotEmpty()
  accountId: string; // The Account ID (e.g. the Bank ID)

  @IsBoolean()
  @IsOptional()
  isRecurring?: boolean;

  @IsString()
  @IsNotEmpty()
  date: string; // ISO Date String
}
