import { Router } from "express";
import userAuthRoutes from "./auth.routes";

const router = Router();

router.use("/auth", userAuthRoutes);

export default router;
