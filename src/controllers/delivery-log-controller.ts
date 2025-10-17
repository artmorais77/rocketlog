import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import z from "zod";

class DeliveryLogController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const bodySchema = z.object({
        description: z.string(),
        deliveryId: z.string().uuid(),
      });

      const { description, deliveryId } = bodySchema.parse(req.body);

      const delivery = await prisma.delivery.findFirst({
        where: { id: deliveryId },
      });

      if (!delivery) {
        throw new AppError("delivery not found", 401);
      }
      if (delivery.status === "processing") {
        throw new AppError("change status to shipped");
      }
      if (delivery.status === "delivered") {
        throw new AppError("this order has already been delivered")
      }

      await prisma.deliveryLog.create({
        data: {
          description,
          deliveryId,
        },
      });
      return res.status(201).json();
    } catch (error) {
      next(error);
    }
  }

  async show(req: Request, res: Response, next: NextFunction) {
    try {
      const paramsSchema = z.object({
        delivery_id: z.string().uuid(),
      });

      const { delivery_id } = paramsSchema.parse(req.params);

      const delivery = await prisma.delivery.findUnique({ 
        where: { id: delivery_id },
        include: {
          logs: true,
          user: true
        }
      })

      if(!delivery) {
        throw new AppError("delivery not found", 404)
      }

      if(req.user?.role === "customer" && req.user?.id !== delivery?.userId) {
        throw new AppError("the user can only view their deliveries", 401)
      }

      return res.status(200).json(delivery)
    } catch (error) {
      next(error);
    }
  }
}

export { DeliveryLogController };
