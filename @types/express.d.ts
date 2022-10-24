declare namespace Express {
  interface Request {
    user: TokenPayload;
  }
}
