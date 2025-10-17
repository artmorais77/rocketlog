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

// src/routes/sessions-routes.ts
var sessions_routes_exports = {};
__export(sessions_routes_exports, {
  sessionsRoutes: () => sessionsRoutes
});
module.exports = __toCommonJS(sessions_routes_exports);

// src/env.ts
var import_zod = __toESM(require("zod"));
var envSchema = import_zod.default.object({
  DATABASE_URL: import_zod.default.string().url(),
  JWT_SECRET: import_zod.default.string(),
  PORT: import_zod.default.coerce.number().default(3333)
});
var env = envSchema.parse(process.env);

// src/configs/auth.ts
var authConfig = {
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: "1d"
  }
};

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

// src/controllers/sessions-controller.ts
var import_bcrypt = require("bcrypt");
var import_jsonwebtoken = require("jsonwebtoken");
var import_zod2 = __toESM(require("zod"));
var SessionsController = class {
  async create(req, res, next) {
    try {
      const bodySchema = import_zod2.default.object({
        email: import_zod2.default.string().trim().email(),
        password: import_zod2.default.string().trim().min(6)
      });
      const { email, password } = bodySchema.parse(req.body);
      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        throw new AppError("Invalid email or password", 401);
      }
      const passwordMatched = await (0, import_bcrypt.compare)(password, user.password);
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
var import_express = require("express");
var sessionsRoutes = (0, import_express.Router)();
var sessionsController = new SessionsController();
sessionsRoutes.post("/", sessionsController.create);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  sessionsRoutes
});
