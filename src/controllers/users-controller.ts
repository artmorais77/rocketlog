import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class UsersController {
  index(req: Request, res: Response) {
    res.status(200).json({ message: "ok" });
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {

      const bodySchema = z.object({
        name: z.string().trim().min(2),
        email: z.string().email(),
        password: z.string().min(6),
      });
      
      const { name, email, password } = bodySchema.parse(req.body);
      
      const userExisting = await prisma.user.findFirst({ where: { email } });
      
      if (userExisting) {
        throw new AppError("User with same email already exists");
      }
      
    const hashedPassword = await hash(password, 8);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
    
    const { password: _, ...userWithoutPassword } = user;
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    next(error)
  }
  }
}

export { UsersController };
