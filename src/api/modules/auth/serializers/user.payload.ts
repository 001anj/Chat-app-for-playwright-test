import { Expose } from "class-transformer";

export class UserPayload {
  @Expose()
  id: number;

  @Expose()
  username: string;

  constructor(partial: Partial<UserPayload>) {
    Object.assign(this, partial);
  }
}
