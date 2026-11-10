import { Expose } from "class-transformer";

export class TokenPayload {
  @Expose()
  accessToken: string;

  constructor(partial: Partial<TokenPayload>) {
    Object.assign(this, partial);
  }
}
