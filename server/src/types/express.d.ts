declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        [key: string]: unknown;
      };
    }
  }
}
