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

// src/app.ts
var app_exports = {};
__export(app_exports, {
  app: () => app
});
module.exports = __toCommonJS(app_exports);
var import_express6 = __toESM(require("express"));
var import_express_async_error = require("express-async-error");

// src/utils/AppError.ts
var AppError = class {
  message;
  statusCode;
  constructor(message, statusCode = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
};

// src/middlewares/error-handling.ts
var import_zod = require("zod");
function errorHandling(error, req, res, next) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message });
  }
  if (error instanceof import_zod.ZodError) {
    return res.status(400).json({
      message: "validation error",
      issues: error.format()
    });
  }
  return res.status(500).json({ message: error.message });
}

// src/routes/index.ts
var import_express5 = require("express");

// src/controllers/users-controller.ts
var import_zod2 = require("zod");
var import_bcrypt = require("bcrypt");

// src/database/prisma.ts
var import_client = require("@prisma/client");
var prisma = new import_client.PrismaClient({
  log: process.env.NODE_ENV === "production" ? [] : ["query"]
});

// src/controllers/users-controller.ts
var UsersController = class {
  index(req, res) {
    res.status(200).json({ message: "ok" });
  }
  async create(req, res, next) {
    try {
      const bodySchema = import_zod2.z.object({
        name: import_zod2.z.string().trim().min(2),
        email: import_zod2.z.string().email(),
        password: import_zod2.z.string().min(6)
      });
      const { name, email, password } = bodySchema.parse(req.body);
      const userExisting = await prisma.user.findFirst({ where: { email } });
      if (userExisting) {
        throw new AppError("User with same email already exists");
      }
      const hashedPassword = await (0, import_bcrypt.hash)(password, 8);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword
        }
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/user-routes.ts
var import_express = require("express");
var usersRoutes = (0, import_express.Router)();
var usersController = new UsersController();
usersRoutes.get("/", usersController.index);
usersRoutes.post("/", usersController.create);

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

// src/controllers/sessions-controller.ts
var import_bcrypt2 = require("bcrypt");
var import_jsonwebtoken = require("jsonwebtoken");
var import_zod4 = __toESM(require("zod"));
var SessionsController = class {
  async create(req, res, next) {
    try {
      const bodySchema = import_zod4.default.object({
        email: import_zod4.default.string().trim().email(),
        password: import_zod4.default.string().trim().min(6)
      });
      const { email, password } = bodySchema.parse(req.body);
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }
      const passwordMatched = await (0, import_bcrypt2.compare)(password, user.password);
      if (!passwordMatched) {
        throw new AppError("Invalid email or password", 401);
      }
      const { secret, expiresIn } = authConfig.jwt;
      const token = (0, import_jsonwebtoken.sign)({ role: user.role ?? "customer" }, secret, {
        subject: user.id,
        expiresIn
      });
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ token, user: userWithoutPassword });
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/sessions-routes.ts
var import_express2 = require("express");
var sessionsRoutes = (0, import_express2.Router)();
var sessionsController = new SessionsController();
sessionsRoutes.post("/", sessionsController.create);

// src/controllers/deliveries-controller.ts
var import_zod5 = __toESM(require("zod"));
var DeliveriesController = class {
  async create(req, res, next) {
    try {
      const bodySchema = import_zod5.default.object({
        userId: import_zod5.default.string().uuid(),
        description: import_zod5.default.string()
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
var import_zod6 = __toESM(require("zod"));
var DeliveriesStatusController = class {
  async create(req, res, next) {
    try {
      const paramsSchema = import_zod6.default.object({
        id: import_zod6.default.string().uuid()
      });
      const bodySchema = import_zod6.default.object({
        status: import_zod6.default.enum(["processing", "shipped", "delivered"])
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

// src/middlewares/ensure-authenticated.ts
var import_jsonwebtoken2 = require("jsonwebtoken");
function ensureAuthenticated(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new AppError("JWT token not found");
    }
    const [, token] = authHeader.split(" ");
    const { role, sub: user_id } = (0, import_jsonwebtoken2.verify)(token, authConfig.jwt.secret);
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
var import_express3 = require("express");
var deliveriesRoutes = (0, import_express3.Router)();
var deliveriesController = new DeliveriesController();
var deliveriesStatusController = new DeliveriesStatusController();
deliveriesRoutes.use(ensureAuthenticated);
deliveriesRoutes.use(verifyUserAuthorization(["sale"]));
deliveriesRoutes.post("/", deliveriesController.create);
deliveriesRoutes.get("/", deliveriesController.index);
deliveriesRoutes.patch("/:id/status", deliveriesStatusController.create);

// src/controllers/delivery-log-controller.ts
var import_zod7 = __toESM(require("zod"));
var DeliveryLogController = class {
  async create(req, res, next) {
    try {
      const bodySchema = import_zod7.default.object({
        description: import_zod7.default.string(),
        deliveryId: import_zod7.default.string().uuid()
      });
      const { description, deliveryId } = bodySchema.parse(req.body);
      const delivery = await prisma.delivery.findFirst({
        where: { id: deliveryId }
      });
      if (!delivery) {
        throw new AppError("delivery not found", 401);
      }
      if (delivery.status === "processing") {
        throw new AppError("change status to shipped");
      }
      if (delivery.status === "delivered") {
        throw new AppError("this order has already been delivered");
      }
      await prisma.deliveryLog.create({
        data: {
          description,
          deliveryId
        }
      });
      return res.status(201).json();
    } catch (error) {
      next(error);
    }
  }
  async show(req, res, next) {
    try {
      const paramsSchema = import_zod7.default.object({
        delivery_id: import_zod7.default.string().uuid()
      });
      const { delivery_id } = paramsSchema.parse(req.params);
      const delivery = await prisma.delivery.findUnique({
        where: { id: delivery_id },
        include: {
          logs: true,
          user: true
        }
      });
      if (req.user?.role === "customer" && req.user?.id !== delivery?.userId) {
        throw new AppError("the user can only view their deliveries", 401);
      }
      return res.status(200).json(delivery);
    } catch (error) {
      next(error);
    }
  }
};

// src/routes/delivery-log.ts
var import_express4 = require("express");
var deliveryLogRoutes = (0, import_express4.Router)();
var deliveryLogController = new DeliveryLogController();
deliveryLogRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["sale"]),
  deliveryLogController.create
);
deliveryLogRoutes.get(
  "/:delivery_id/show",
  ensureAuthenticated,
  verifyUserAuthorization(["sale", "customer"]),
  deliveryLogController.show
);

// src/routes/index.ts
var routes = (0, import_express5.Router)();
routes.use("/users", usersRoutes);
routes.use("/sessions", sessionsRoutes);
routes.use("/deliveries", deliveriesRoutes);
routes.use("/delivery-log", deliveryLogRoutes);

// src/app.ts
var app = (0, import_express6.default)();
app.use(import_express6.default.json());
app.use(routes);
app.use(errorHandling);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  app
});
