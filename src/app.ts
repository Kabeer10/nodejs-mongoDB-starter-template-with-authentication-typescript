import express from "express";
import { Env } from "./config";
import loader from "./loaders";

console.clear();
console.log(
  "\x1b[34m%s\x1b[0m",
  "🕑------ Initializing... Please Wait... ------🕑"
);

async function initialize() {
  const app = express();
  await loader(app);
  app.listen(Env.PORT, () => {
    console.log(
      "\x1b[32m%s\x1b[0m",
      `🚀------- Server Running on Port ${Env.PORT} -------🚀`
    );
  });
}

initialize().catch((err) => {
  console.log("\x1b[31m%s\x1b[0m", "❌------ Server Failed to Start ------❌");
  console.log(err);
});
