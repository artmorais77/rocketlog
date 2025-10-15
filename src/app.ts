import express from "express";
import "express-async-error"
import { errorHandling } from "./middlewares/error-handling";
import { routes } from "./routes";

const app = express();

app.use(express.json());
app.use(routes)
app.use(errorHandling)

export { app };
