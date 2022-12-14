import logger from "../logger";
import en from "../lang/errorCodes";
import { Request } from "express";
import { ErrorCodes } from "../../../@types/logs";

export default (
  req: Request,
  data?: any,
  message?: string,
  code?: ErrorCodes,
  fields?: any
) => {
  let resMessage = message;
  if (code != null) {
    let key = code;
    if (!en[code]) key = "00008";
    let userId = "";

    if (req?.user?._id) userId = req.user._id;

    const enMessage = en[key];
    if (enMessage.includes("server error")) {
      logger(code, userId, message, "Server Error", req).catch((err) => {
        console.log(err);
      });
    } else {
      logger(code, userId, message ?? enMessage, "Client Error", req).catch(
        (err) => {
          console.log(err);
        }
      );
    }
    resMessage = code === "00008" ? message ?? enMessage : enMessage;
  }

  return {
    data,
    error: {
      code,
      message: resMessage,
      fields,
    },
  };
};
