/// <reference path="../express.d.ts" />
import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { sendResponse } from '../utils/responseUtil';
import STATUS_CODES from '../utils/statusCodes';

export const authAdmin = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
        if (err) {
            sendResponse(res, false, err, "Server error during authentication", STATUS_CODES.SERVER_ERROR);
            return;
        }

        if (!user) {
            sendResponse(res, false, null, "Unauthorized", STATUS_CODES.UNAUTHORIZED);
            return;
        }

        if (user.role === "ADMIN") {
            req.user = user;
            return next();
        }

        return sendResponse(res, false, null, "Admin access required", STATUS_CODES.FORBIDDEN);
    })(req, res, next);
};

export const authUser = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate("jwt", { session: false }, (err: any, user: any) => {
        if (err) {
            sendResponse(res, false, err, "Server error during authentication", STATUS_CODES.SERVER_ERROR);
            return;
        }

        if (!user) {
            sendResponse(res, false, null, "Unauthorized", STATUS_CODES.UNAUTHORIZED);
            return;
        }

        if (user.role === "USER") {
            req.user = user;
            return next();
        }

        return sendResponse(res, false, null, "User access required", STATUS_CODES.FORBIDDEN);
    })(req, res, next);
};

export const authAdminOrUser = (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate("jwt", { session: false }, async (err: any, user: any) => {
        if (err) {
            return sendResponse(res, false, err, "Server error during authentication", STATUS_CODES.SERVER_ERROR);
        }

        if (!user) {
            return sendResponse(res, false, null, "Unauthorized. Login to Continue", STATUS_CODES.UNAUTHORIZED);
        }

        if (user.role === "ADMIN" || user.role === "USER") {
            req.user = user;
            return next();
        }

        return sendResponse(res, false, null, "Unauthorized", STATUS_CODES.FORBIDDEN);
    })(req, res, next);
};
