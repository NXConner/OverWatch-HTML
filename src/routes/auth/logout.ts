import { Router } from "express";
import { clearSessionCookie } from "../../auth/session-cookie";

const router = Router();

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).send();
});

export default router;
