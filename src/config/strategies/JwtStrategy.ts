import passport from "passport";
import jwtStrategy, { StrategyOptions } from "passport-jwt";
import Env from "../env";

const opts: StrategyOptions = {
  jwtFromRequest: jwtStrategy.ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: Env.JWT_SECRET_KEY,
};

// Used by the authenticated requests to deserialize the user,
// i.e., to fetch user details from the JWT.
passport.use(
  "jwt",
  new jwtStrategy.Strategy(opts, (user, done) => done(null, user))
);
