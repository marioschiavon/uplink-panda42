import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { authMiddleware } from "./middlewares/auth.js";
import messagesRouter from "./routes/messages.router.js";
import sessionsRouter from "./routes/sessions.router.js";
import organizationsRouter from "./routes/organizations.router.js";
import { attachSocket } from "./socket/index.js";
import { supaAdmin } from "./lib/supabaseClient.js";
//import { getSessionStatus, startSession } from "./lib/wppconnectApi.js";
import apiRouter from "./routes/api.router.js";
import internalWebhook from "./routes/webhook.router.js";


const PORT = Number(process.env.PORT || 3001);
const FRONTEND_URL = process.env.FRONTEND_URL!;
const PANEL_TOKEN = process.env.PANEL_TOKEN!;

const app = express();
app.set("trust proxy", true);
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: FRONTEND_URL, credentials: true }));

/** Rotas públicas */
app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/v1", apiRouter);

/** Rotas autenticadas por Supabase JWT */
app.use(authMiddleware);
app.use("/messages", messagesRouter);
app.use("/sessions", sessionsRouter);
app.use("/organization", organizationsRouter);

/** Webhook interno */
app.post("/internal/webhook", (req, res) => {
  const key = req.headers["x-panel-token"];
  if (key !== PANEL_TOKEN) return res.status(401).json({ error: "Unauthorized" });
  return res.json({ ok: true });
});

app.use("/internal", internalWebhook);
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: FRONTEND_URL, methods: ["GET", "POST"] } });
attachSocket(io);
app.set("io", io);

httpServer.listen(PORT, () => {
  console.log(`Bridge listening on :${PORT}`);
});

/** ------------------------------
 * WATCHDOG de sessão (a cada 60s)
 * ------------------------------ */
//const WATCHDOG_INTERVAL_MS = 60_000;
//setInterval(async () => {
  //try {
    //const { data: sessions, error } = await supaAdmin
     // .from("sessions")
     // .select("id,name,organization_id,status")
     // .order("created_at", { ascending: false });

   // if (error || !sessions?.length) return;

    //for (const s of sessions) {
      //try {
        //const st = await getSessionStatus(s.name);
        //const rawState =
         // typeof (st as any)?.state === "string"
         //   ? (st as any).state
          //  : typeof (st as any)?.status === "string"
          //  ? (st as any).status
           // : "";
        //const state = rawState.toLowerCase();

        //if (state && state !== (s.status || "").toLowerCase()) {
          //await supaAdmin.from("sessions")
         //   .update({ status: state })
          //  .eq("id", s.id);
        //}

       // if (["disconnected", "browserclosed", "stream_closed", "notfound", "failure"]
          //.some(k => state.includes(k))) {
       //   await startSession(s.name);
       // }
   //   } catch {
     //   try { await startSession(s.name); } catch {}
     // }
  //  }
 // } catch {}
//}, WATCHDOG_INTERVAL_MS);
