import "reflect-metadata";

import "dotenv/config";
import jwt from "jsonwebtoken";

import { createExpressServer, type Action } from "routing-controllers";
import { AuthController } from "./modules/auth/auth.controller";
import { FeedbackController } from "./modules/feedback/feedback.controller";
import { authConfig } from "./config";

const app = createExpressServer({
  cors: true,
  controllers: [AuthController, FeedbackController],
  currentUserChecker: async (action: Action) => {
    let token = action.request.headers["authorization"] ?? "";
    token = token.split(" ")[1];
    if (!token) {
      return;
    }

    const tokenPayload = jwt.verify(token, authConfig.accessTokenSecret);
    if (!tokenPayload) {
      return;
    }

    return tokenPayload;
  },
  validation: true,
  classTransformer: true,
});

export { app };
