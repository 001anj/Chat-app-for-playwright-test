import { Expose, Type } from "class-transformer";
import { UserPayload } from "./../../auth/serializers/user.payload";

export class FeedbackPayload {
  @Expose()
  id!: number;

  @Expose()
  title!: string;

  @Expose()
  body!: string;

  @Expose()
  @Type(() => UserPayload)
  author!: UserPayload;

  @Expose()
  @Type(() => UserPayload)
  receiver!: UserPayload;

  constructor(partial: Partial<FeedbackPayload>) {
    Object.assign(this, partial);
  }
}
