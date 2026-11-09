import { IsNotEmpty, IsNumber, IsString, Length } from "class-validator";

export class FeedbackCreateDto {
  @IsNotEmpty()
  @Length(3)
  @IsString()
  title: string;

  @IsNotEmpty()
  @Length(3, 10000)
  @IsString()
  body: string;

  @IsNotEmpty()
  @IsNumber()
  receiverId!: number;
}
