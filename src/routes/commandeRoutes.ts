import Router from 'express';
import { getCommandeByRep, downloadAr,  updateDelaiprec, getVersion} from 'src/controllers/commandeControllers';

const router = Router();

router
    .get('/:user', getCommandeByRep)
    .get('/download/:cde', downloadAr)
    .put('/updateDelaiprec', updateDelaiprec)
    .get('/version/:spVersion', getVersion)
export default router;