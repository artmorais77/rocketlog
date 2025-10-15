import { authConfig } from "@/configs/auth"
import { AppError } from "@/utils/AppError"
import { Request, Response, NextFunction} from "express"
import { verify } from "jsonwebtoken"

interface TokenPayload {
  role: string
  sub: string
}

function ensureAuthenticated (req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization

    if(!authHeader) {
      throw new AppError("JWT token not found")
    }

    const [, token] = authHeader.split(" ")

    const {role, sub: user_id} = verify(token, authConfig.jwt.secret) as TokenPayload

    req.user = {
      id: user_id,
      role,
    }

    next()
  } catch (error) {
    throw new AppError("Invalid JWT token", 401)
  }
}

export {ensureAuthenticated}