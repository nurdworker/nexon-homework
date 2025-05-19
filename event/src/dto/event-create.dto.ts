import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ConditionDto {
  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  key: string;

  @IsNumber()
  value: number;
}

class RewardDto {
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @IsNumber()
  quantity: number;
}

export class EventCreateDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  description?: string;

  @IsDateString()
  startAt: string;

  @IsNumber()
  periodInDays: number;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConditionDto)
  conditions: ConditionDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RewardDto)
  rewards: RewardDto[];
}
