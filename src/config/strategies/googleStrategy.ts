import passport from "passport";
import googleStrategy from "passport-google-oauth20";
import { Env } from "..";
import { User } from "../../models";

passport.use(
  new googleStrategy.Strategy(
    {
      clientID: Env.GOOGLE_CLIENT_ID,
      clientSecret: Env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${Env.PUBLIC_URL}/api/user/auth/google/callback`,
    },
    async (_, __, profile, cb) => {
      const { name, email, picture } = profile._json;
      const user = await User.findOne({ email });
      if (user) {
        if (!user.authProviders.includes("GOOGLE")) {
          user.authProviders.push("GOOGLE");
          await user.save();
        }
        return cb(null, user);
      }
      const newUser = await User.create({
        fullName: name,
        email,
        photoUrl: picture,
        authProviders: ["GOOGLE"],
        emailVerified: true,
      });
      return cb(null, newUser);
    }
  )
);
