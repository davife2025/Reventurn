import "dotenv/config";
import express from "express";
import cors from "cors";
import { healthRouter } from "./routes/health";
import { ratesRouter } from "./routes/rates";
import { assetsRouter } from "./routes/assets";
import { chatRouter } from "./routes/chat";
import { solanaAssetsRouter } from "./routes/solana-assets";

const app = express();
const port = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN?.split(",") ?? "http://localhost:3000";

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.use("/health", healthRouter);
app.use("/rates", ratesRouter);
app.use("/assets", assetsRouter);
app.use("/assets/solana", solanaAssetsRouter);
app.use("/chat", chatRouter);

// Goal-based investing and the borrowing/lending layer are still not here
// — each is its own future feature boundary per the build ruleset.

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`reventurn-api listening on :${port}`);
});
