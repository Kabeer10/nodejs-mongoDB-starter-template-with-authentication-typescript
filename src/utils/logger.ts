import { Request } from "express";
import mongoose from "mongoose";
import { ErrorCodes, ErrorLevel } from "../../@types/logs";
import { Log } from "../models/index";
import ipHelper from "./helpers/ip-helper";

export default async (
  code: ErrorCodes,
  userId?: string,
  errorMessage?: string,
  level?: ErrorLevel,
  req?: Request
) => {
  let ip: string | undefined = "no-ip";
  if (req !== undefined) ip = ipHelper(req);
  const log = new Log({
    resultCode: code,
    level,
    errorMessage,
    ip,
  });

  if (userId !== "" && userId) log.userId = new mongoose.Types.ObjectId(userId);
  console.log(log);
  await log.save().catch((err: any) => {
    console.error(err);
    process.exit(1);
  });
};
