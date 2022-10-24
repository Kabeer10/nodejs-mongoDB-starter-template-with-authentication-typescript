import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Env } from "../../../config";
import { User } from "../../../models";
import { ipHelper, resHandler, sendEmailOtp, verifyOtp } from "../../../utils";
import {
  COOKIE_OPTIONS,
  generateLoginTokens,
} from "../../middlewares/auth.middleware";

export async function register(req: Request, res: Response) {
  const { username, email, fullName, password, device } = req.body;
  try {
    if (await User.isEmailExists(email)) {
      return res
        .status(400)
        .json(resHandler(req, null, "Email already exists", "00032"));
    }

    if (await User.isUsernameExists(username)) {
      return res
        .status(400)
        .json(resHandler(req, null, "Username already exists", "00084"));
    }

    const newUser = await User.register(
      new User({
        username,
        email,
        fullName,
        authProviders: ["LOCAL"],
      }),
      password
    );

    const { token, refreshToken } = generateLoginTokens({
      _id: newUser._id,
      username: newUser.username,
      emailVerified: newUser.emailVerified,
      isDeleted: newUser.isDeleted,
      createdAt: new Date(),
    });
    newUser.sessions.push({
      refreshToken,
      device: device ?? "Unknown",
      ip: ipHelper(req),
    });
    await newUser.save();
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    return res
      .status(200)
      .json(
        resHandler(
          req,
          { token, user: newUser },
          "User registered successfully"
        )
      );
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function login(req: Request, res: Response) {
  try {
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    if (!user) {
      return res
        .status(400)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    const { token, refreshToken } = generateLoginTokens({
      _id: user._id,
      username: user.username,
      emailVerified: user.emailVerified,
      isDeleted: user.isDeleted,
      createdAt: new Date(),
    });
    user.sessions.push({
      refreshToken,
      device: req.body.device ?? "Unknown",
      ip: ipHelper(req),
    });
    await user.save();
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);

    if (req.body.type === "GOOGLE") {
      return res.redirect(Env.PUBLIC_URL);
    }

    return res
      .status(200)
      .json(resHandler(req, { token, user }, "User logged in successfully"));
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    if (!user) {
      return res
        .status(400)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    const i = user.sessions.findIndex(
      (session) => session.refreshToken === refreshToken
    );

    if (i === -1) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res
        .status(401)
        .json(resHandler(req, null, "Refresh token not found", "00012"));
    }

    user.sessions.splice(i, 1);
    await user.save();
    res.clearCookie("refreshToken", COOKIE_OPTIONS);
    return res
      .status(200)
      .json(resHandler(req, null, "User logged out successfully"));
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function forgetPassword(req: Request, res: Response) {
  try {
    const { username } = req.body;
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!user) {
      return res
        .status(400)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    await sendEmailOtp(user.email, user.username, "RESET_PASSWORD");
    return res.status(200).json(resHandler(req, null, "OTP sent successfully"));
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { username, otp, password } = req.body;
    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    });
    if (!user) {
      return res
        .status(400)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    await verifyOtp(otp, user.username, "RESET_PASSWORD");

    await user.setPassword(password);
    await user.save();
    return res
      .status(200)
      .json(resHandler(req, null, "Password reset successfully"));
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function sendEmailVerification(req: Request, res: Response) {
  try {
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    if (!user) {
      return res
        .status(400)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    if (user.emailVerified) {
      return res
        .status(400)
        .json(resHandler(req, null, "Email already verified", "00088"));
    }
    await sendEmailOtp(user.email, user.username, "EMAIL_VERIFICATION");
    return res.status(200).json(resHandler(req, null, "OTP sent successfully"));
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function verifyEmail(req: Request, res: Response) {
  try {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    const { otp } = req.body;
    const user = await User.findOne({ _id: req.user._id, isDeleted: false });
    if (!user) {
      return res
        .status(400)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    await verifyOtp(otp, user.username, "EMAIL_VERIFICATION");

    const { token, refreshToken: newRefreshToken } = generateLoginTokens({
      _id: user._id,
      username: user.username,
      emailVerified: true,
      isDeleted: user.isDeleted,
      createdAt: new Date(),
    });

    const i = user.sessions.findIndex(
      (session) => session.refreshToken === refreshToken
    );

    if (i === -1) {
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res
        .status(401)
        .json(resHandler(req, null, "Refresh token not found", "00012"));
    }
    user.emailVerified = true;
    user.sessions[i].refreshToken = newRefreshToken;
    await user.save();
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);

    return res.status(200).json(
      resHandler(req, {
        token,
        user,
      })
    );
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}

export async function refreshToken(req: Request, res: Response) {
  try {
    const { signedCookies = {} } = req;
    const { refreshToken } = signedCookies;
    if (!refreshToken) {
      return res
        .status(401)
        .json(resHandler(req, null, "Refresh token not found", "00006"));
    }
    const payload = jwt.verify(
      refreshToken,
      Env.REFRESH_TOKEN_SECRET_KEY
    ) as TokenPayload;

    const user = await User.findOne({ _id: payload._id, isDeleted: false });

    if (!user) {
      return res
        .status(401)
        .json(resHandler(req, null, "User not found", "00036"));
    }
    const i = user.sessions.findIndex(
      (session) => session.refreshToken === refreshToken
    );

    if (i === -1) {
      return res
        .status(401)
        .json(resHandler(req, null, "Refresh token not found", "00012"));
    }
    if (
      new Date(payload.createdAt).getTime() <
      new Date().getTime() - 3 * 60 * 60 * 1000
    ) {
      user.sessions.splice(i, 1);
      await user.save();
      res.clearCookie("refreshToken", COOKIE_OPTIONS);
      return res
        .status(401)
        .json(resHandler(req, null, "Inactive for 3 hours", "00011"));
    }

    const { token, refreshToken: newRefreshToken } = generateLoginTokens({
      _id: user._id,
      username: user.username,
      emailVerified: user.emailVerified,
      isDeleted: user.isDeleted,
      createdAt: new Date(),
    });
    user.sessions[i].refreshToken = newRefreshToken;
    await user.save();
    res.cookie("refreshToken", newRefreshToken, COOKIE_OPTIONS);
    return res
      .status(200)
      .json(
        resHandler(req, { token, user }, "Refresh token generated successfully")
      );
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}
