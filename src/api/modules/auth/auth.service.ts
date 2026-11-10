import { compare } from "bcrypt";
import jwt from "jsonwebtoken";

import { SignInDto } from "./dtos/sign-in.dto";
import { TokenPayload } from "./serializers/token.payload";

import { prisma } from "./../../utils/db";
import { authConfig } from "./../../config";

export type AccessTokenPayload = {
  sub: number;
};

export class AuthService {
  static async signIn(input: SignInDto): Promise<TokenPayload | undefined> {
    const user = await prisma.user.findFirst({
      where: { username: { equals: input.username, mode: "insensitive" } },
    });
    if (!user) {
      return;
    }

    const isValid = await compare(input.password, user.password);
    if (!isValid) {
      return;
    }

    const accessTokenPayload: AccessTokenPayload = { sub: user.id };
    const accessToken = jwt.sign(accessTokenPayload, authConfig.accessTokenSecret, {
      expiresIn: "30d",
      issuer: "chat-app-for-testing",
    });

    return {
      accessToken,
    };
  }

  static async findUnique(input: { id: number }) {
    return prisma.user.findUnique({ where: { id: input.id }, select: { id: true, username: true, password: true } });
  }

  static findMany() {
    return prisma.user.findMany({ select: { id: true, username: true } });
  }
}
