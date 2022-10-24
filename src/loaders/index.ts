import { dbConnect } from "./mongoose";
import expressLoader from "./express";
import { Application } from "express";

export default async (app: Application) => {
  await dbConnect();
  await expressLoader(app);
};
