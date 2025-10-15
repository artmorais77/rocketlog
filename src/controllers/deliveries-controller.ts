import { Request, Response, NextFunction } from "express";

class DeliveriesController {
  create(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(201).json({ message: "ok" });
    } catch (error) {
      next(error);
    }
  }
}

export { DeliveriesController };
