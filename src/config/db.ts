import dotenv from 'dotenv';
import { config } from 'mssql';

dotenv.config(
    {
        path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    }
);


const config: config = {
    user: process.env.DB_USER || '',
    password: process.env.DB_PWD || '',
    server: process.env.DB_SERV || '',
    database: process.env.DB_NAME || '',
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
    encrypt: true, // for azure
    trustServerCertificate: true 
    }
};


export default config;