import { Router } from "express";
import type { ApiResponse, HealthStatus } from "@reventurn/types";

export const healthRouter = Router();

healthRouter.get("/", (_req, res) => {
  const body: ApiResponse<HealthStatus> = {
    ok: true,
    data: {
      status: "ok",
      service: "reventurn-api",
      timestamp: new Date().toISOString()
    }
  };
  res.status(200).json(body);
});
