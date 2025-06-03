import express from 'express';
import { verifyToken } from '../middleware/verifyToken.js';
import { asyncHandler } from '../util/asyncHandler.js';
import { getUserQualifications } from '../util/qualification.js';

const router = express.Router();

router.get(
  '/:uid',
  asyncHandler(verifyToken),
  asyncHandler(async (req, res) => {
    try {
      // Only authenticated users can access this data
      if (!req.user) {
        res.status(401).json({ message: 'Authentication required.' });
        return;
      }

      // Users can only request their own qualification data
      const requestedUid = req.params.uid;
      const currentUid = req.user.uid;

      if (currentUid !== requestedUid) {
        res.status(403).json({
          message: 'Access denied. You can only view your own qualifications. ',
        });
        return;
      }

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
