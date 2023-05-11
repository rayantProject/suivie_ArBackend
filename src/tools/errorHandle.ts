
import { Request, Response } from 'express';

    export function error500(error: Error, req: Request, res: Response) {
        console.error(error);
        res.status(500).send({ error: error.message });
    }
    export function error404(req: Request, res: Response) {
        res.status(404).send({ error: 'Not found' });
        
    }

    export function error401(req: Request, res: Response) {
        res.status(401).send({ error: `Unauthorized` });
    }


