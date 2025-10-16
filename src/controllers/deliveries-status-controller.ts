import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class DeliveriesStatusController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid(),
      });

      const bodySchema = z.object({
        status: z.enum(["processing", "shipped", "delivered"]),
      });

      const { id } = paramsSchema.parse(req.params);
      const { status } = bodySchema.parse(req.body);

      const delivery = await prisma.delivery.findFirst({ where: { id } });

      if (!delivery) {
        throw new AppError("delivery not found");
      }

      await prisma.delivery.update({
        data: {
          status,
        },
        where: {
          id,
        },
      });

      res.status(201).json();
    } catch (error) {
      next(error);
    }
  }
}

export { DeliveriesStatusController };
