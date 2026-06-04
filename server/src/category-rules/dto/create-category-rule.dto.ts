import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateCategoryRuleDto {
  @IsString()
  @IsNotEmpty()
  keyword: string;

  @IsUUID()
  @IsNotEmpty()
  categoryId: string;
}
