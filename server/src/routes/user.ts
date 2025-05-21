import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { asyncHandler } from "../util/asyncHandler.js";
import { getUserDetails, addUser } from "../util/user.js";

const router = express.Router();

router.post('/', asyncHandler(async (req, res) => {
  try {
    const user = await addUser(req.body);
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: `Error creating user: ${err}`});
  }
}))

router.get('/:uid', asyncHandler(async(req, res, next) => {
  try {
    console.log(req.params.uid);
    const userDetails = await getUserDetails(req.params.uid);
    if (!userDetails || Object.keys(userDetails).length === 0) {
      console.log('User not found');
      res.status(404).json({ message: "User not found." });
      return;
    }
    console.log('User found');
    res.status(200).json(userDetails);
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: `Error finding user details: ${err}`});
  }
}))




export default router;