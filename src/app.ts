import express, { Request, Response , NextFunction} from 'express';
import * as ErrorHandle from 'src/tools/errorHandle';
import routes from './routes/routes';
import cors from 'cors';
import logger from './middleware/logger';

const app = express();
const port = process.env.PORT || 3000;

app.use(logger);
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
    console.error('Port 3000 is already in use');
    process.exit(1);
} else {
    console.error('Unhandled error:', err.message);
    res.status(500).send('Internal server error');
}
});

app.use('/api', routes);
app.use("*",  ErrorHandle.error404);
app.use(ErrorHandle.error500);


app.listen(port, () => {console.log(`Server running on port ${port}`)});
