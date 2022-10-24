import passport from "passport";
import localStrategy from "passport-local";
import { User } from "../../models";

passport.use("local", new localStrategy.Strategy(User.authenticate()));
