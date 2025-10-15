import { authConfig } from "@/configs/auth";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import z from "zod";

class SessionsController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        email: z.string().trim().email(),
        password: z.string().trim().min(6),
      });

      const { email, password } = bodySchema.parse(req.body);

      const user = await prisma.user.findFirst({ where: { email } });

      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }

      const passwordMatched = await compare(password, user.password);

      if (!passwordMatched) {
        throw new AppError("Invalid email or password", 401);
      }

      const { secret, expiresIn } = authConfig.jwt;

      const token = sign({ role: user.role ?? "customer" }, secret, {
        subject: user.id,
        expiresIn,
      });

      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }
}

export { SessionsController };
