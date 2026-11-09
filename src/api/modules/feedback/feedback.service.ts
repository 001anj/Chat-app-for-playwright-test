import sanitizeHtml from "sanitize-html";

import { prisma } from "./../../utils/db";

import type { FeedbackCreateDto } from "./dtos/feedback-create.dto";
import type { AccessTokenPayload } from "./../auth/auth.service";

export class FeedbackService {
  static findMany() {
    return prisma.feedback.findMany({
      take: 50,
      select: {
        id: true,
        title: true,
        body: true,
        author: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static createOne(input: FeedbackCreateDto, tokenPayload: AccessTokenPayload) {
    return prisma.feedback.create({
      data: {
        title: sanitizeHtml(input.title, { allowedTags: [] }),
        body: sanitizeHtml(input.body),
        receiverId: input.receiverId,
        authorId: tokenPayload.sub,
      },
      select: {
        id: true,
        title: true,
        body: true,
        author: { select: { id: true, username: true } },
        receiver: { select: { id: true, username: true } },
      },
    });
  }
}
