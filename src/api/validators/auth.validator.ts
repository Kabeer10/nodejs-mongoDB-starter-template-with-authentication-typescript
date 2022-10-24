import Joi from "joi";
import { Request, Response, NextFunction } from "express";
import { resHandler } from "../../utils";

export function validateRegister(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { body } = req;
  const schema = Joi.object({
    username: Joi.string().min(4).max(17).required(),
    email: Joi.string().email().required(),
    fullName: Joi.string().min(3).max(40).required(),
    password: Joi.string().min(6).max(20).required(),
  });

  const { value, error } = schema.validate(body);
  if (error) {
    return res.status(400).json(
      resHandler(
        req,
        null,
        error.message,
        "00087",
        error.details.map((err) => ({ message: err.message, path: err.path }))
      )
    );
  }
  req.body = value;
  next();
}

export function validateLogin(req: Request, res: Response, next: NextFunction) {
  const { body } = req;
  const schema = Joi.object({
    username: Joi.string().min(4).max(17).required(),
    password: Joi.string().min(6).max(20).required(),
  });

  const { value, error } = schema.validate(body);
  if (error) {
    return res.status(400).json(
      resHandler(
        req,
        null,
        error.message,
        "00087",
        error.details.map((err) => ({ message: err.message, path: err.path }))
      )
    );
  }
  req.body = value;
  next();
}
