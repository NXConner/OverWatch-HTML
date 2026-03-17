import { Router } from "express";
import { randomUUID } from "node:crypto";
import { prisma } from "../../../lib/prisma";
import { parseBody, signupSchema } from "../../../lib/validators";
import { hashPassword } from "../../auth/password";
import { signAuthToken } from "../../auth/jwt";
import { setSessionCookie } from "../../auth/session-cookie";
import type { AuthRole } from "../../types/auth";

const router = Router();

router.post("/signup", async (req, res, next) => {
  try {
    const parsed = parseBody(signupSchema, req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const role: AuthRole = "operator";

    const user = await prisma.user.create({
      data: {
        email,
        password: passwordHash,
        role,
        name: parsed.data.name?.trim() || null
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    const token = signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role as AuthRole,
      sessionId: randomUUID()
    });

    setSessionCookie(res, token);
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

export default router;
