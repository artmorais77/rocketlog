import express from "express";
import "express-async-error"
import { errorHandling } from "./middlewares/error-handling";

const app = express();

app.use(express.json());

app.use(errorHandling)

export { app };
