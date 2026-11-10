export const serverConfig = {
  port: Number.parseInt(process.env.SERVICE_PORT || "3022", 10),
};

export const authConfig = {
  accessTokenSecret: String(process.env.ACCESS_TOKEN_SECRET),
};
