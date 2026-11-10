import { execSync } from "node:child_process";

export default function globalSetup() {
  if (process.env.SKIP_DB_RESEED) {
    return;
  }
  execSync("npm run db:seed", { stdio: "inherit" });
}
