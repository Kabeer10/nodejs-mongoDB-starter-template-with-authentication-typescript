import mongoose, { Types } from "mongoose";

const { Schema } = mongoose;

export interface ISession {
  _id: Types.ObjectId;
  refreshToken: string;
  device?: string;
  ip?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    device: {
      type: String,
    },
    ip: {
      type: String,
    },
  },
  { timestamps: true }
);
export default sessionSchema;
