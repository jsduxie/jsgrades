import * as express from "express"

declare global {
    namespace Express {
        interface Request {
            user?: {
                uid: string;
                [key: string]: any;
            };
        }
    }
}