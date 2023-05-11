import Router from 'express';
import messageRoutes from './messageRoutes';
import commandRoutes from './commandeRoutes';
import testRoutes from './testRoutes';
const router = Router();

router
    .use('/messages', messageRoutes)
    .use('/representants', commandRoutes)
    .use('/test', testRoutes)
export default router;