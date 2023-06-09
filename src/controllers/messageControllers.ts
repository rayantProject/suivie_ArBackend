import mssql from 'mssql';
import { NextFunction, Request, Response } from 'express';
import config  from '../config/db';
import Message from 'src/models/Message';
import { log } from 'console';

const dbname = process.env.DB_NAME;
const pool = new mssql.ConnectionPool(config);


function consoleTable(data: any) {
    const keys = Object.keys(data[0]);
    const header = keys.join('\t');
    const rows = data.map((obj: any )  => keys.map(key => obj[key]).join('\t'));
  
    console.log(header);
    console.log(rows.join('\n'));
  }

export const getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.connect();
        const result = await pool.request()
        .query(`
            USE ${dbname}
            SELECT * FROM MESSAGES WHERE LCKTNUMERO = '${req.params.cde}' ORDER BY CREATED_AT DESC
        `);
        const messages :Message[] = result.recordset.map((p: any) => {
            return {
                createdAt: p.CREATED_AT,
                message: p.MESSAGE_TEXT,
                isRead: p.IS_READ,
                spAccount : p.SHP_LOGIN,
                cde : p.LCKTNUMERO,
                rep : p.REPRESENTANT,
                pbDelai : p.PB_DELAI
            };
        });

        res.status(200).send(messages);

    } catch (err: any) {
        next(err);
    }
};

export const createMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const pbDelaiValue = !!req.body.pbDelai ? 1 : 0;
        await pool.connect();
        console.table(req.body);
        const result = await pool.request().query(`
        USE ${dbname}
        INSERT INTO MESSAGES (LCKTNUMERO, SHP_LOGIN, REPRESENTANT, MESSAGE_TEXT, PB_DELAI)
        VALUES ('${req.body.cde}', '${req.body.login}', '${req.body.rep}', '${req.body.message}', (${pbDelaiValue}))`);
        res.status(200).send({"message": "message created"});
    } catch (err: any) {
        next(err);
    }
};

export const isRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.connect();
        const read = req.body.isRead !== undefined ? req.body.isRead : true;
        const result = await pool.request().query(`
        USE ${dbname}
        UPDATE MESSAGES
        SET IS_READ = ${read ? 1 : 0}
        WHERE LCKTNUMERO = '${req.body.cde}'
        AND SHP_LOGIN <> '${req.body.login}'
        `);
        res.status(200).send({
                "message": "messages read"
            });
    } catch (err: any) {
        next(err);
    }
};
export const changeReadStatusForOneMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.connect();
        const read = req.body.isRead !== undefined ? req.body.isRead : true;
        // console.table(req.body);
        const result = await pool.request().query(`
        USE ${dbname}
        UPDATE MESSAGES
        SET IS_READ = ${read ? 1 : 0}
        WHERE LCKTNUMERO = '${req.body.cde}'
        AND SHP_LOGIN = '${req.body.login}'
        AND CREATED_AT = '${req.body.createdAt}'
        `);
        res.status(200).send({
                "message": "messages read status changed"
            });
    } catch (err: any) {
        next(err);
    }
};

export const numbOfUnreadMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await pool.connect();
        const result = await pool.request()
        .query(`USE ${dbname}
        SELECT COUNT(*) AS NB FROM MESSAGES
        WHERE LCKTNUMERO = '${req.params.cde}'
        AND SHP_LOGIN <> '${req.params.login}'
        AND IS_READ = 0
        `);
        
        res.status(200).json({
            cde: req.params.cde,
            nb: result.recordset[0].NB
        });

    } catch (err: any) {
        next(err);
    }
};

