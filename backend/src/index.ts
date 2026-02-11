import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import { db } from "./db/client.js";
import { authRouter } from "./routes/auth.js";
import { workspaceRouter } from "./routes/workspace.js";
import { contactsRouter } from "./routes/contacts.js";
import { inboxRouter } from "./routes/inbox.js";
import { bookingsRouter } from "./routes/bookings.js";
import { formsRouter } from "./routes/forms.js";
import { inventoryRouter } from "./routes/inventory.js";
import { dashboardRouter } from "./routes/dashboard.js";
import { publicRouter } from "./routes/public.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors({ origin: config.frontendUrl, credentials: true }));
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/workspaces", workspaceRouter);
app.use("/api/contacts", contactsRouter);
app.use("/api/inbox", inboxRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/forms", formsRouter);
app.use("/api/inventory", inventoryRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/public", publicRouter);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

async function start() {
  try {
    await db.init();
    app.listen(config.port, () => {
      console.log(`Server running on http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
