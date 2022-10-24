import mongoose, { Types } from "mongoose";

const { Schema, model } = mongoose;

export interface ILog extends mongoose.Document {
  userId?: Types.ObjectId;
  resultCode: string;
  level: string;
  errorMessage: string;
  ip: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const logSchema = new Schema<ILog>(
  {
    userId: { type: mongoose.Schema.Types.ObjectId },
    resultCode: { type: String, required: true },
    level: { type: String, required: true },
    errorMessage: { type: String, required: true },
    ip: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Log = model("Log", logSchema);
export default Log;
