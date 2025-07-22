import express from "express";
import { dataByQuery } from "../controllers/dataByQuery.js";
import { paramsData } from "../controllers/paramsData.js";

export const apiRouter = express.Router();

apiRouter.get("/", dataByQuery);
apiRouter.get("/:field/:term", paramsData);
