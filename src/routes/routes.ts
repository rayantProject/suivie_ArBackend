import Router from 'express';
import messageRoutes from './messageRoutes';
import commandRoutes from './commandeRoutes';

const router = Router();

router
    .use('/messages', messageRoutes)
    .use('/representants', commandRoutes)

export default router;