import { Router } from "express";
import userAuthRoutes from "./userAuthRouter";

const router = Router();

router.use("/auth", userAuthRoutes);

export default router;
