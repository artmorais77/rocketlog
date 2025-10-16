import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class DeliveriesController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        userId: z.string().uuid(),
        description: z.string(),
      });

      const { userId, description } = bodySchema.parse(req.body);

      const user = await prisma.user.findFirst({ where: { id: userId } });

      if (!user) {
        throw new AppError("Invalid user");
      }

      await prisma.delivery.create({
        data: {
          userId,
          description,
        },
      });

      res.status(201).json();
    } catch (error) {
      next(error);
    }
  }

  async index(req: Request, res: Response, next: NextFunction) {
    try {
      const delivery = await prisma.delivery.findMany({
        include: {
          user: { select: { name: true, email: true } },
        },
      });

      return res.json(delivery);
    } catch (error) {
      next(error);
    }
  }
}

export { DeliveriesController };
