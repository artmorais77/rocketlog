"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/routes/deliveries-routes.ts
var deliveries_routes_exports = {};
__export(deliveries_routes_exports, {
  deliveriesRoutes: () => deliveriesRoutes
});
module.exports = __toCommonJS(deliveries_routes_exports);

// src/database/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"]
});

// src/utils/AppError.ts
var AppError = class {
  message;
  statusCode;
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
};

// src/controllers/deliveries-controller.ts
var import_zod = __toESM(require("zod"));
var DeliveriesController = class {
  async create(req, res, next) {
    try {
      const bodySchema = import_zod.default.object({
        userId: import_zod.default.string().uuid(),
        description: import_zod.default.string()
      });
      const { userId, description } = bodySchema.parse(req.body);
      const user = await prisma.user.findFirst({ where: { id: userId } });
      if (!user) {
        throw new AppError("Invalid user");
      }
      await prisma.delivery.create({
        data: {
          userId,
          description
        }
      });
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  }
  async index(req, res, next) {
    try {
      const delivery = await prisma.delivery.findMany({
        include: {
          user: { select: { name: true, email: true } }
        }
      });
      return res.json(delivery);
    } catch (error) {
      next(error);
    }
  }
};

// src/controllers/deliveries-status-controller.ts
var import_zod2 = __toESM(require("zod"));
var DeliveriesStatusController = class {
  async create(req, res, next) {
    try {
      const paramsSchema = import_zod2.default.object({
        id: import_zod2.default.string().uuid()
      });
      const bodySchema = import_zod2.default.object({
        status: import_zod2.default.enum(["processing", "shipped", "delivered"])
      });
      const { id } = paramsSchema.parse(req.params);
      const { status } = bodySchema.parse(req.body);
      const delivery = await prisma.delivery.findFirst({ where: { id } });
      if (!delivery) {
        throw new AppError("delivery not found");
      }
      await prisma.delivery.update({
        data: {
          status
        },
        where: {
          id
        }
      });
      await prisma.deliveryLog.create({
        data: {
          deliveryId: id,
          description: status
        }
      });
      res.status(201).json();
    } catch (error) {
      next(error);
    }
  }
};

// src/env.ts
var import_zod3 = __toESM(require("zod"));
var envSchema = import_zod3.default.object({
  DATABASE_URL: import_zod3.default.string().url(),
  JWT_SECRET: import_zod3.default.string(),
  PORT: import_zod3.default.coerce.number().default(3333)
});
var env = envSchema.parse(process.env);

// src/configs/auth.ts
var authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "1d"
  }
};

// src/middlewares/ensure-authenticated.ts
var import_jsonwebtoken = require("jsonwebtoken");
function ensureAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError("JWT token not found");
    }
    const [, token] = authHeader.split(" ");
    const { role, sub: user_id } = (0, import_jsonwebtoken.verify)(token, authConfig.jwt.secret);
    req.user = {
      id: user_id,
      role
    };
    next();
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }
}

// src/middlewares/verifyUserAuthorization.ts
function verifyUserAuthorization(role) {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }
    if (!role.includes(req.user.role)) {
      throw new AppError("Unauthorized", 401);
    }
    return next();
  };
}

// src/routes/deliveries-routes.ts
var import_express = require("express");
var deliveriesRoutes = (0, import_express.Router)();
var deliveriesController = new DeliveriesController();
var deliveriesStatusController = new DeliveriesStatusController();
deliveriesRoutes.use(ensureAuthenticated);
deliveriesRoutes.use(verifyUserAuthorization(["sale"]));
deliveriesRoutes.post("/", deliveriesController.create);
deliveriesRoutes.get("/", deliveriesController.index);
deliveriesRoutes.patch("/:id/status", deliveriesStatusController.create);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  deliveriesRoutes
});
