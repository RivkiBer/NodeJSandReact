import express from "express";
import cors from "cors";
import routes from "./routes/index.js";
import { requestLogger } from "./middleware/logger.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.use("/api", routes);
app.use(errorHandler);

export default app;
