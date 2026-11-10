import { JsonController, Body, Get, Post, ForbiddenError, CurrentUser, UnauthorizedError } from "routing-controllers";

import { SignInDto } from "./dtos/sign-in.dto";
import { UserPayload } from "./serializers/user.payload";
import { TokenPayload } from "./serializers/token.payload";

import { AuthService, type AccessTokenPayload } from "./auth.service";

@JsonController("/auth")
export class AuthController {
  @Get("/me")
  async me(@CurrentUser({ required: true }) tokenPayload: AccessTokenPayload): Promise<UserPayload> {
    const user = await AuthService.findUnique({ id: tokenPayload.sub });

    if (!user) {
      throw new UnauthorizedError();
    }

    return user;
  }

  @Get("/users")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async allUsers(@CurrentUser({ required: true }) _tokenPayload: AccessTokenPayload): Promise<UserPayload[]> {
    return AuthService.findMany();
  }

  @Post("/sign-in")
  async signIn(@Body() input: SignInDto): Promise<TokenPayload> {
    const token = await AuthService.signIn(input);

    if (!token) {
      throw new ForbiddenError();
    }

    return token;
  }
}
