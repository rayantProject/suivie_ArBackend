import Router from 'express';
import { getCommandeByRep, downloadAr } from 'src/controllers/commandeControllers';

const router = Router();

router
    .get('/:user', getCommandeByRep)
    .get('/download/:cde', downloadAr);

export default router;