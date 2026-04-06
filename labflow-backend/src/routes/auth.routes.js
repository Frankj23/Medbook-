import { Router } from "express";
import {
  login,
  registerRoleUser,
  logout,
} from "../controllers/auth.controller.js";

const router = Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/register", registerRoleUser);

export default router;
