import { IsEnum, IsNotEmpty, IsOptional, IsString, Matches } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['INCOME', 'EXPENSE'])
  @IsOptional()
  type: 'INCOME' | 'EXPENSE' = 'EXPENSE';

  @IsString()
  @IsOptional()
  @Matches(/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/, {
    message: 'color must be a valid hex color',
  })
  color: string = '#64748b';

  @IsString()
  @IsOptional()
  icon?: string;
}
