import express from 'express';
import { asyncHandler } from '../util/asyncHandler.js';
import { getUserQualifications } from '../util/qualification.js';
import { verifyUser } from '../middleware/verifyUser.js';

const router = express.Router();

router.get(
  '/:uid',
  // Returns 401 if unauthenticated, 403 if attempting to modify other users' data
  asyncHandler(verifyUser),
  asyncHandler(async (req, res) => {
    try {
      const requestedUid = req.params.uid;

      const qualifications = await getUserQualifications(requestedUid);
      res.status(200).json(qualifications);
    } catch (err) {
      res.status(500).json({
        message: `Error retrieving qualifications for user ${req.params.uid}: ${err}`,
      });
    }
  })
);


export default router;
