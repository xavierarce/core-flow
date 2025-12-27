import { IsOptional, IsString, IsIn } from 'class-validator';

export class GetAccountsQueryDto {
  @IsOptional()
  @IsString()
  @IsIn(['name', 'balance'])
  orderBy?: 'name' | 'balance' = 'name';

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  transactionsOrder?: 'asc' | 'desc' = 'desc';
}
