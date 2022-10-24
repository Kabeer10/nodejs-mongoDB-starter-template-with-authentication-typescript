import mongoose, {
  Model,
  PassportLocalDocument,
  PassportLocalModel,
  PassportLocalSchema,
  Types,
} from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

import sessionSchema, { ISession } from "./common/sessionSchema";

const { Schema, model } = mongoose;

export interface IUser extends PassportLocalDocument {
  email: string;
  username: string;
  authProviders: Array<"GOOGLE" | "LOCAL">;
  fullName?: string;
  gender?: Gender;
  country?: string;
  photoUrl?: string;
  isDeleted: boolean;
  emailVerified: boolean;
  deletedAt?: Date;
  sessions: Types.DocumentArray<ISession>;
  sms?: {
    code: string;
    expires: Date;
    purpose: OtpPurpose;
  };
}
// extent the mongoose schema with passport-local-mongoose
interface IUserModel extends PassportLocalModel<IUser> {
  isUsernameExists: (username: string) => Promise<boolean>;
  isEmailExists: (email: string) => Promise<boolean>;
}

const userSchema = new Schema(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      match:
        /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    fullName: {
      type: String,
      required: true,
      minLength: [3, "Last name should be more than 3 characters"],
      maxLength: [40, "Last name should be less than 15 characters"],
    },
    username: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      match: /^(?=.{4,17}$)(?:[a-zA-Z\d]+(?:(?:\.|-|_)[a-zA-Z\d])*)+$/,
    },
    authProviders: {
      type: [String],
      enum: ["GOOGLE", "LOCAL"],
    },

    gender: {
      type: String,
      enum: ["MALE", "FEMALE", "OTHER"],
    },
    country: {
      type: String,
    },

    photoUrl: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Node.js_logo.svg/1200px-Node.js_logo.svg.png",
    },
    // NOTE: To check whether the account is active or not. When user deletes the account, you can store the information anonymously.
    isDeleted: {
      type: Boolean,
      default: false,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    // NOTE: In case the user delete its account, you can store its non-personalized information anonymously.
    deletedAt: {
      type: Date,
    },
    sessions: {
      type: [sessionSchema],
    },

    sms: {
      code: String,
      expires: Date,
      purpose: String,
    },
  },
  {
    timestamps: true,
  }
) as PassportLocalSchema<IUserModel, Model<IUser>>;

userSchema.set("toJSON", {
  transform(_, ret) {
    delete ret.sessions;
    delete ret.salt;
    delete ret.hash;
    delete ret.sms;
    delete ret.isDeleted;
    delete ret.deletedAt;
    return ret;
  },
});

userSchema.static(
  "isUsernameExists",
  async function isUsernameExists(username: string): Promise<boolean> {
    const user = await this.findOne({
      username,
    });
    return !!user;
  }
);
userSchema.static(
  "isEmailExists",
  async function isEmailExists(email: string): Promise<boolean> {
    const user = await this.findOne({
      email,
    });
    return !!user;
  }
);

// TODO: check if email is modified or not

userSchema.plugin(passportLocalMongoose, {
  usernameQueryFields: ["email", "phoneNumber"],
  maxAttempts: 5,
  unlockInterval: 1000 * 60 * 10,
});

export default model<IUser, IUserModel>("User", userSchema);
