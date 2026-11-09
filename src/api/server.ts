import { app } from "./app";
import { logger } from "./utils/logger";
import { serverConfig } from "./config";

app.listen(serverConfig.port, () => {
  logger.info(`Server stated and listening on port ${serverConfig.port}`);
});
