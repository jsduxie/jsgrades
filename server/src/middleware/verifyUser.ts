import { Request, Response, NextFunction } from 'express';
import { verifyToken } from "./verifyToken";


export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  await new Promise<void>((resolve, reject) => {
    verifyToken(req, res, (err?: any) => {
        if (err) reject(err);
        else resolve();
    });
  }).catch(() => {
    // verifyToken would have already returned 401
    return;
  })

  // Check if response has already been sent
  if (res.headersSent) {
    return;
  }

  if (!req.user) {
    res.status(401).json({ message: 'Authentication required.' });
    return;
  }

  const requestedUid = req.params.uid;
  const currentUid = req.user.uid;

  if (currentUid !== requestedUid) {
    res.status(403).json({
        message: 'Access denied. You can only view your own qualifications.',
    });
    return;
  }

  next();
};
