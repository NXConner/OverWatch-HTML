import { Router } from "express";
import { prisma } from "../../../lib/prisma";
import { authRequired } from "../../middleware/auth-required";

const router = Router();

router.get("/me", authRequired, async (req, res, next) => {
  try {
    const auth = req.auth;
    if (!auth) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
