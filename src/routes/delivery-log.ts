import { DeliveryLogController } from "@/controllers/delivery-log-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyUserAuthorization";
import { Router } from "express";

const deliveryLogRoutes = Router();
const deliveryLogController = new DeliveryLogController();

deliveryLogRoutes.post(
  "/",
  ensureAuthenticated,
  verifyUserAuthorization(["sale"]),
  deliveryLogController.create
);

export { deliveryLogRoutes };
