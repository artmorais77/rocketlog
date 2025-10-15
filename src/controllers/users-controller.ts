import { Request, Response } from "express";
import { z } from "zod";

class UsersController {
  index(req: Request, res: Response) {
    res.status(200).json({ message: "ok" });
  }

  create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    res.status(201).json({ name, email, password });
  }
}

export { UsersController };
