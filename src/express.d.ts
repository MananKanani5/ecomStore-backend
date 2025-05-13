import * as express from "express";

declare global {
    namespace Express {
        interface User {
            id: string;
            role: "USER" | "ADMIN" | "SUPERADMIN";
        }

        interface Request {
            user?: User;
        }
    }
}