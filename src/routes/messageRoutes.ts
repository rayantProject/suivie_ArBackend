import Router from 'express';
const router = Router();
import { getMessages, createMessage, isRead, numbOfUnreadMessages, changeReadStatusForOneMessage } from '../controllers/messageControllers';

router
    .get('/:cde', getMessages)
    .post('/', createMessage)
    .put('/read', isRead)
    .put('/readOne', changeReadStatusForOneMessage)
    .get('/unread/:cde/:login', numbOfUnreadMessages);

export default router;