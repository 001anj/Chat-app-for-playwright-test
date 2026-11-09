import { JsonController, Get, Post, Body, CurrentUser } from "routing-controllers";

import type { AccessTokenPayload } from "./../auth/auth.service";
import type { FeedbackCreateDto } from "./dtos/feedback-create.dto";
import type { FeedbackPayload } from "./serializers/feedback.payload";

import { FeedbackService } from "./feedback.service";

@JsonController("/feedback")
export class FeedbackController {
  @Get("/")
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  all(@CurrentUser({ required: true }) _tokenPayload: AccessTokenPayload): Promise<FeedbackPayload[]> {
    return FeedbackService.findMany();
  }

  @Post("/")
  create(
    @CurrentUser({ required: true }) tokenPayload: AccessTokenPayload,
    @Body() input: FeedbackCreateDto,
  ): Promise<FeedbackPayload> {
    return FeedbackService.createOne(input, tokenPayload);
  }
}
