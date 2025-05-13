import { Request, Response } from "express";
import { sendResponse } from "../utils/responseUtil";
import STATUS_CODES from "../utils/statusCodes";
import { validateLoginUserSchema, validateUserRegister } from "../validators/userValidator";
import prisma from "../prisma";
import { comparePassword, hashPassword } from "../utils/authUtils";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import passport from "passport";

dayjs.extend(utc);
dayjs.extend(timezone);

export const userRegister = async (req: Request, res: Response): Promise<void> => {

    const { error } = validateUserRegister(req.body);

    if (error) {
        sendResponse(res, false, error, error.message, STATUS_CODES.BAD_REQUEST);
        return;
    }

    const { firstName, lastName, email, password, phone } = req.body;

    try {

        const existUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existUser) {
            sendResponse(res, false, {}, 'User already exist with same email', STATUS_CODES.BAD_REQUEST);
            return;
        }

        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: await hashPassword(password),
                phone,
            }
        });

        sendResponse(res, true, newUser, 'User registered successfully', STATUS_CODES.OK);
    } catch (error: any) {
        sendResponse(res, false, error, error.message, STATUS_CODES.SERVER_ERROR);
    }
}

export const userLogin = async (req: Request, res: Response): Promise<void> => {
    const { error } = validateLoginUserSchema(req.body);
    if (error) {
        sendResponse(res, false, error, error.details[0].message, STATUS_CODES.BAD_REQUEST);
        return;
    }

    const { email, password } = req.body;

    try {
        const existUser = await prisma.user.findFirst({
            where: { email },
        });

        if (!existUser) {
            sendResponse(res, false, null, "User not found", STATUS_CODES.NOT_FOUND);
            return;
        }

        const hasUserRole = existUser.role === "USER";

        if (!hasUserRole) {
            sendResponse(res, false, null, "Access denied. You do not have user privileges.", STATUS_CODES.FORBIDDEN);
            return;
        }

        const isPasswordValid = await comparePassword(password, existUser.password || "");

        if (!process.env.JWT_SECRET) {
            throw new Error("jwt secret is not defined");
        }

        const token = jwt.sign(
            { id: existUser.id, role: "USER" },
            process.env.JWT_SECRET,
            { expiresIn: "90d" }
        );


        const user = await prisma.user.findUnique({
            where: { email }
        })


        const formatteduser = {
            ...user,
            createdAt: dayjs.utc(user?.createdAt).tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm"),
            updatedAt: dayjs.utc(user?.updatedAt).tz("Asia/Kolkata").format("YYYY-MM-DDTHH:mm"),
        };

        sendResponse(res, true, { user: formatteduser, token }, "You are logged in successfully", STATUS_CODES.OK);

    } catch (error: any) {
        sendResponse(res, false, error, error.message, STATUS_CODES.BAD_REQUEST);
    }
};

export const google = passport.authenticate('google', { scope: ['profile', 'email'] });


export const googleCallback = (req: Request, res: Response) => {
    passport.authenticate('google', {
        session: false,
        failureRedirect: '/login'
    })(req, res, async () => {
        try {
            if (!process.env.JWT_SECRET) throw new Error('JWT secret missing');

            const user = req.user as any;
            const token = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '90d' }
            );

            console.log(user, jwt);


            res.redirect(`${process.env.FRONTEND_URL}/auth?token=${token}`);
        } catch (error) {
            console.error('Error in Google callback:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
        }
    });
}