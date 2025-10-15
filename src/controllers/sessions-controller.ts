import { Request, Response } from "express";

class SessionsController {
  create(req: Request, res: Response) {
    res.status(201).json({ message: "ok" });
  }
}

export { SessionsController };
