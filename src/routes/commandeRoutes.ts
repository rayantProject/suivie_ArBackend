import Router from 'express';
import { getCommandeByRep, downloadAr,  updateDelaiprec} from 'src/controllers/commandeControllers';

const router = Router();

router
    .get('/:user', getCommandeByRep)
    .get('/download/:cde', downloadAr)
    .put('/updateDelaiprec', updateDelaiprec)


export default router;