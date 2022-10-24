import mongoose from "mongoose";
import { Env } from "../config";

async function dbConnect() {
  try {
    await mongoose.connect(Env.DB_URI);
    console.clear();
    // console log in red with database emoji
    console.log("\x1b[31m%s\x1b[0m", "🗄️------- Database Connected -------🗄️");
  } catch (err: any) {
    console.log(err.message);
    // counsole log in Bright red
    console.log(
      "\x1b[31m%s\x1b[0m",
      "🗄️------- Database Connection Failed -------🗄️"
    );
    process.exit(1);
  }
}

const conn = mongoose.connection;
export { conn, dbConnect };
