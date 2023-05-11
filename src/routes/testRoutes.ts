import Router from 'express';
import {  downloadAr,  updateDelaiprec} from 'src/controllers/commandeControllers';
import { getCommandes} from 'src/controllers/testControllers';

const router = Router();

router
    .get('/:user', getCommandes)
    .get('/download/:cde', downloadAr)
    .put('/updateDelaiprec', updateDelaiprec)


export default router;