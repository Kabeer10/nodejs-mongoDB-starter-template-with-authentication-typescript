import { config } from "dotenv";

config();
export default {
  DB_URI: process.env.DB_URI as string,
  PORT: Number(process.env.PORT) as number,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY as string,
  REFRESH_TOKEN_SECRET_KEY: process.env.REFRESH_TOKEN_SECRET_KEY as string,
  COOKIE_SECRET: process.env.COOKIE_SECRET as string,
  NODE_ENV: process.env.NODE_ENV as string,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY as string,
  SESSION_EXPIRY: process.env.SESSION_EXPIRY as string,
  PREFIX: "/api",
};
