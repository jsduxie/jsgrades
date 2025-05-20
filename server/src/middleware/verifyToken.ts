import admin from "../Firebase.js";
import { Request, Response, NextFunction } from "express";

export const verifyToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).send("No token");
    return;
  }

  const token = header.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name || decoded.displayName,
    };
    next(); // Pass control to the next middleware
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).send("Invalid token");
  }
};