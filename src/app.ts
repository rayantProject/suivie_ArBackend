import express, { Request, Response , NextFunction} from 'express';
import * as ErrorHandle from 'src/tools/errorHandle';
import routes from './routes/routes';
import cors from 'cors';
import logger from './middleware/logger';
import ipFilter from './middleware/IpFilter';


// to use express with apache porxy pass
// app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');

//  to use express with nginx proxy pass
// app.set('trust proxy', true);
// app.set('trust proxy', 'loopback,

// to have the real ip address of the client
// app.set('trust proxy', true);
// app.set('trust proxy', 'loopback');
// app.use((req, res, next) => {
//     req.ip = req.ips[0] || req.ip;
//     next();
// });


const app = express();
const port = process.env.PORT || 3000;
app.set('trust proxy', true);
app.set('trust proxy', 'loopback');
app.use(logger);
// app.use(ipFilter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
    {
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type,Authorization',
        credentials: true

    }
));

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use`);
    process.exit(1);
} else {
    console.error('Unhandled error:', err.message);
    res.status(500).send('Internal server error');
}
});

app.use(
    (req: Request, res: Response, next: NextFunction) => {
        const referer = req.headers.referer || req.headers.referrer;

        if (referer && referer.includes('lec69009.sharepoint') || referer && referer.includes('localhost')) {
            next();
        }else{
            
            res.status(401).send({ error: 'Unauthorized' });
        }
    }
);
app.use('/api', routes);
app.use("*",  ErrorHandle.error404);
app.use(ErrorHandle.error500);


app.listen(port, () => {console.log(`Server running on port ${port}`)});