import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { getUserDetails } from "../util/user.js";

const router = express.Router();

router.get(
  "/dashboard",
  asyncHandler(verifyToken),
  asyncHandler(async (req, res, next) => {
    if (!req.user) {
      res.status(400).send("User not authenticated");
      return;
    }

    res.status(200).json({ message: `Welcome, ${req.user.name}` });
  })
);

router.get('/:uid', asyncHandler(async(req, res, next) => {
  try {
    console.log(req.params.uid);
    const userDetails = await getUserDetails(req.params.uid);
    if (!userDetails || Object.keys(userDetails).length === 0) {
      console.log('User not found');
      return res.status(404).json({ message: "User not found." });
    }
    console.log('User found');
    res.status(200).json(userDetails);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: `Error finding user details: ${err}`});
  }
}))




export default router;