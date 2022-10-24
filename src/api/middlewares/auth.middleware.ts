/* eslint-disable no-eval */
import { NextFunction, Request, Response, CookieOptions } from "express";
import jwt from "jsonwebtoken";
import passport from "passport";

import { Env } from "../../config";
import { resHandler } from "../../utils";

const COOKIE_OPTIONS: CookieOptions =
  Env.NODE_ENV === "production"
    ? {
        // check
        domain: "api.example.com",
        httpOnly: true,
        secure: true,
        sameSite: "none",
        signed: true,
        maxAge: eval(Env.REFRESH_TOKEN_EXPIRY) * 1000,
      }
    : {
        httpOnly: false,
        secure: false,
        maxAge: eval(Env.REFRESH_TOKEN_EXPIRY) * 1000,
        signed: true,
      };

function getRefreshToken(user: TokenPayload): string {
  return jwt.sign(user, Env.REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: eval(Env.REFRESH_TOKEN_EXPIRY),
  });
}

// FOR EMAIL OR OTHER TYPES OF VERIFICATION
function getToken(user: TokenPayload): string {
  return jwt.sign(user, Env.JWT_SECRET_KEY, {
    expiresIn: eval(Env.SESSION_EXPIRY),
  });
}

function getVerifyToken(user: TokenPayload): string {
  return jwt.sign(user, Env.JWT_SECRET_KEY, {
    expiresIn: 60 * 5,
  });
}

function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, Env.JWT_SECRET_KEY) as TokenPayload;
    return decoded;
  } catch (err) {
    return null;
  }
}

function verifyJWT(req: Request, res: Response, next: NextFunction) {
  passport.authenticate(
    "jwt",
    { session: false },
    (err, user: TokenPayload) => {
      if (err) {
        return res
          .status(500)
          .json(resHandler(req, null, err.message, "00008"));
      }
      if (user === null) {
        return res
          .status(403)
          .json(resHandler(req, user, "Invalid Credentials", "00012"));
      }
      if (!user.emailVerified) {
        return res
          .status(401)
          .json(resHandler(req, null, "Email not verified", "00044"));
      }
      if (user.isDeleted) {
        return res
          .status(401)
          .json(resHandler(req, null, "User is deleted", "00043"));
      }

      req.user = user ?? null;
      next();
    }
  )(req, res, next);
}

function generateLoginTokens(user: TokenPayload): {
  token: string;
  refreshToken: string;
} {
  const token = getToken(user);
  const refreshToken = getRefreshToken(user);
  return { token, refreshToken };
}
export {
  getVerifyToken,
  verifyToken,
  verifyJWT,
  generateLoginTokens,
  COOKIE_OPTIONS,
};
