import { DeliveriesController } from "@/controllers/deliveries-controller";
import { ensureAuthenticated } from "@/middlewares/ensure-authenticated";
import { verifyUserAuthorization } from "@/middlewares/verifyuserAuthorization";
import { Router } from "express";

const deliveriesRoutes = Router();
const deliveriesController = new DeliveriesController();

deliveriesRoutes.use(ensureAuthenticated);

deliveriesRoutes.post("/", verifyUserAuthorization(["sale"]), deliveriesController.create);
deliveriesRoutes.get("/", verifyUserAuthorization(["sale"]), deliveriesController.index);

export { deliveriesRoutes };
