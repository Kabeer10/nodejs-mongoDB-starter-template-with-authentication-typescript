import { Request, Response } from "express";
import { User } from "../../../models";
import { resHandler } from "../../../utils";
import {
  COOKIE_OPTIONS,
  generateLoginTokens,
} from "../../middlewares/auth.middleware";

export async function register(req: Request, res: Response) {
  const { username, email, fullName, password } = req.body;
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
    });
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
    });
    res.cookie("refreshToken", refreshToken, COOKIE_OPTIONS);
    return res
      .status(200)
      .json(resHandler(req, { token, user }, "User logged in successfully"));
  } catch (err: any) {
    res.status(500).json(resHandler(req, null, err.message, "00008"));
  }
}
