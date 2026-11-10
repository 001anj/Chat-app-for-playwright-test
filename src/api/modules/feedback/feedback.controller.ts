import { JsonController, Get, Post, Body, CurrentUser, BadRequestError } from "routing-controllers";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";

import type { AccessTokenPayload } from "./../auth/auth.service";
import { FeedbackCreateDto } from "./dtos/feedback-create.dto";
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
  async create(
    @CurrentUser({ required: true }) tokenPayload: AccessTokenPayload,
    @Body() rawInput: FeedbackCreateDto,
  ): Promise<FeedbackPayload> {
    // esbuild-runner (used in dev) doesn't emit TypeScript's decorator metadata, so
    // routing-controllers can't auto-detect the @Body() DTO class to validate against.
    // Validating explicitly here keeps the class-validator rules on FeedbackCreateDto enforced.
    const input = plainToClass(FeedbackCreateDto, rawInput);
    const errors = await validate(input);
    if (errors.length > 0) {
      const message = errors
        .flatMap((error) => Object.values(error.constraints ?? {}))
        .join(", ");
      throw new BadRequestError(message);
    }

    return FeedbackService.createOne(input, tokenPayload);
  }
}
