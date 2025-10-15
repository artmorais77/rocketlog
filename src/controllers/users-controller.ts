import { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt"

class UsersController {
  index(req: Request, res: Response) {
    res.status(200).json({ message: "ok" });
  }

  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2),
      email: z.string().email(),
      password: z.string().min(6),
    });
    
    const { name, email, password } = bodySchema.parse(req.body);
    
    const hashedPassword = await hash(password, 8)

    res.status(201).json({ name, email, hashedPassword });
  }
}

export { UsersController };
