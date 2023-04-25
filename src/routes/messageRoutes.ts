import Router from 'express';
const router = Router();
import { getMessages, createMessage, isRead, numbOfUnreadMessages } from '../controllers/messageControllers';

router
    .get('/:cde', getMessages)
    .post('/', createMessage)
    .put('/read', isRead)
    .get('/unread/:cde/:login', numbOfUnreadMessages);

export default router;