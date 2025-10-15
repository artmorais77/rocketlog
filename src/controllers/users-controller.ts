import { Request, Response } from "express";

class UsersController {
  index(req: Request, res: Response) {
    res.status(200).json({ message: "ok" });
  }

  create(req: Request, res: Response) {
    res.status(201).json({ message: "ok" });
  }
}

export { UsersController };
