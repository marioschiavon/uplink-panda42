import type { Server } from "socket.io";
import { createClient } from "@supabase/supabase-js";
import { supaAdmin } from "../lib/supabaseClient.js";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const FRONTEND_URL = process.env.FRONTEND_URL!;

export function attachSocket(io: Server) {
  io.engine.on("headers", (headers) => {
    headers["Access-Control-Allow-Origin"] = FRONTEND_URL;
  });

  io.use(async (socket, next) => {
    try {
      const tokenHeader = typeof socket.handshake.headers.authorization === "string"
        ? socket.handshake.headers.authorization
        : undefined;
      const token = (socket.handshake.auth as any)?.token || tokenHeader?.replace("Bearer ", "");
      if (!token) return next(new Error("Missing token"));

      const supa = createClient(SUPABASE_URL, token, { auth: { persistSession: false } });
      const { data: { user }, error } = await supa.auth.getUser();
      if (error || !user) return next(new Error("Invalid token"));

      const { data: profile, error: pErr } = await supaAdmin
        .from("users").select("organization_id, role").eq("id", user.id).single();
      if (pErr || !profile) return next(new Error("Profile not found"));

      socket.data.user = { id: user.id, organization_id: profile.organization_id, role: profile.role };
      socket.join(`org:${profile.organization_id}`);
      next();
    } catch (e: any) {
      next(new Error(e?.message || "Socket auth error"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ping", () => socket.emit("pong"));
    // futuros broadcasts: io.to(`org:${orgId}`).emit("message:new", payload);
  });
}
