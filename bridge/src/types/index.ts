import "express";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; organization_id: string; role: string; name?: string };
    }
  }
}

export {};
