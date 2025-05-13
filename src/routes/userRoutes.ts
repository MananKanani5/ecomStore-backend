import { Router } from 'express';
import { google, googleCallback, userLogin, userRegister } from '../controllers/userControllers';
import passport from 'passport';
const router = Router();

router.post("/register", userRegister);
router.post("/login", userLogin);
router.get("/google", google);
router.get('/google/callback', googleCallback);

export default router;