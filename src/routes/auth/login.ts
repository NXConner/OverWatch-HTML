import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { prisma } from "../../../lib/prisma";
import { parseBody } from "../../../lib/validators";
import { verifyPassword } from "../../auth/password";
import { signAuthToken } from "../../auth/jwt";
import { setSessionCookie } from "../../auth/session-cookie";
import type { AuthRole } from "../../types/auth";

const router = Router();

const loginSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(1, "Password required")
});

router.post("/login", async (req, res, next) => {
  try {
    const parsed = parseBody(loginSchema, req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const email = parsed.data.email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        createdAt: true
      }
    });

    if (!user?.password) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const passwordMatches = await verifyPassword(parsed.data.password, user.password);
    if (!passwordMatches) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: (user.role === "admin" ? "admin" : "operator") as AuthRole,
      sessionId: randomUUID()
    });

    setSessionCookie(res, token);

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
