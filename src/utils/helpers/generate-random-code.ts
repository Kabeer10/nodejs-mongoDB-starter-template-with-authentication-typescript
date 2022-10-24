import { generate } from "randomstring";

export default (length: number) => generate({ length, charset: "numeric" });
