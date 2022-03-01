"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Catches errors and passes them to the next callback
 * @param handler Async express request handler/middleware potentially throwing errors
 * @returns Async express request handler with error handling
 */
exports.default = (handler) => (req, res, next) => handler(req, res, next).catch(next);
