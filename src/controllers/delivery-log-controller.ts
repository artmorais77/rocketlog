import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class DeliveryLogController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        description: z.string(),
        deliveryId: z.string().uuid()
      })

      const {description, deliveryId} = bodySchema.parse(req.body)

      const delivery = await prisma.delivery.findFirst({ where: { id: deliveryId}})

      if (!delivery) {
        throw new AppError("delivery not found", 401)
      }
      if (delivery.status === "processing") {
        throw new AppError("change status to shipped")
      }

      await prisma.deliveryLog.create({
        data: {
          description,
          deliveryId
        }
      })
      return res.status(201).json()
    } catch (error) {
      next(error);
    }
  }
}

export { DeliveryLogController };
