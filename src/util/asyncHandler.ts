/* eslint-disable no-unused-vars */
import { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;
/**
 * Catches errors and passes them to the next callback
 * @param handler Async express request handler/middleware potentially throwing errors
 * @returns Async express request handler with error handling
 */
export default (handler: AsyncRequestHandler): RequestHandler =>
    (req, res, next) =>
        handler(req, res, next).catch(next);
