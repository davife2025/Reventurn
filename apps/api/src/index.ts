import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";

const app = express();
const port = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use("/health", healthRouter);

// Theme-specific routes (rate-differential data, X Layer reads, etc.) are
// intentionally not here — they belong to a Session 2+ feature session per
// the build ruleset ("infra before theme").

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`reventurn-api listening on :${port}`);
});
