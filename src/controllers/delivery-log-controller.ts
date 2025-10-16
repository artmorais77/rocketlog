import { Request, Response, NextFunction } from "express";

class DeliveryLogController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      return res.status(201).json({ message: "ok" });
    } catch (error) {
      next(error);
    }
  }
}

export { DeliveryLogController };
