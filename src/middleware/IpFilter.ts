import requestIp from 'request-ip';

import { Request, Response, NextFunction } from 'express';


const allowedIps = [
    "",
    '13.107.136.0/22',
    '40.108.128.0/17',
    '52.104.0.0/14',
    '104.146.128.0/17',
    '150.171.40.0/22',
    '2603:1061:1300::/40',
    '2620:1ec:8f8::/46',
    '2620:1ec:908::/46',
    '2a01:111:f402::/48',
    '*.sharepoint.com',
    'lec69009.sharepoint.com',
    '192.168.200.44'
];

export default (req: Request, res: Response, next: NextFunction  ) => {
    

    const clientIp = requestIp.getClientIp(req);
    console.log(clientIp);
    !!allowedIps.find(ip => ip ==  clientIp ) ? next() : res.status(401).send({ error: 'Unauthorized' });
}