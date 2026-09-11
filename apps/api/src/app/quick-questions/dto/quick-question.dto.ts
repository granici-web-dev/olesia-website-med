import { IsString, MinLength } from 'class-validator';

export class AnswerTicketDto {
  @IsString()
  @MinLength(1)
  answer!: string;
}
