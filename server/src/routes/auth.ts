import express from "express";
import pool from "../db/conn.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { asyncHandler } from "../util/asyncHandler.js";

const router = express.Router();

router.post(
  "/auth",
  asyncHandler(verifyToken),
  asyncHandler(async (req, res) => {
    if (!req.user) {
      res.status(400).send("User information is missing");
      return;
    }
    const { uid, email, name } = req.user;

    try {
      const userQuery = await pool.query("SELECT * FROM users WHERE uid = $1", [uid]);

      if (userQuery.rows.length === 0) {
        const insertQuery = `
          INSERT INTO users (uid, email, name)
          VALUES ($1, $2, $3)
          RETURNING *
        `;

        const newUser = await pool.query(insertQuery, [uid, email, name]);
        res.status(201).json({ user: newUser.rows[0] });
        return;
      }

      res.status(200).json({ user: userQuery.rows[0] });
    } catch (err) {
      console.error(`Error handling user authentication: ${err}`);
      res.status(500).send("Internal Server Error");
    }
  })
);

export default router;