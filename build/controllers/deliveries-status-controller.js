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

// src/controllers/deliveries-status-controller.ts
var deliveries_status_controller_exports = {};
__export(deliveries_status_controller_exports, {
  DeliveriesStatusController: () => DeliveriesStatusController
});
module.exports = __toCommonJS(deliveries_status_controller_exports);

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

// src/controllers/deliveries-status-controller.ts
var import_zod = __toESM(require("zod"));
var DeliveriesStatusController = class {
  async create(req, res, next) {
    try {
      const paramsSchema = import_zod.default.object({
        id: import_zod.default.string().uuid()
      });
      const bodySchema = import_zod.default.object({
        status: import_zod.default.enum(["processing", "shipped", "delivered"])
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  DeliveriesStatusController
});
