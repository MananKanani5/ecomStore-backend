import { Router } from 'express';
import { Request, Response } from 'express';
import userRoutes from './routes/authRoutes';

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.send('API is Running');
});


router.use('/auth', userRoutes);


export default router;
