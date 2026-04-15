import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateReclamationDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  status?: string;
}
