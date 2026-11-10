import { IsInt, IsNotEmpty, IsString, Length } from "class-validator";

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
  @IsInt()
  receiverId!: number;
}
