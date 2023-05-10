import mssql from 'mssql';
import { Request, Response, NextFunction } from 'express';
import Commande from 'src/models/Commande';
import Message from 'src/models/Message';
import {error401} from 'src/tools/errorHandle';
import config  from 'src/config/db';
import transformRequestToCommandeByReps from 'src/tools/commandeTools';


const pool = new mssql.ConnectionPool(config), dbname = process.env.DB_NAME || '',

requestCommandes = `use ${dbname}
select l.LCKTNUMERO, l.LCKTLIGNE, l.LCCTCODART, l.LCCTCOMART, l.LCCNQTECDE, l.LCCNQTEEXP, l.LCCNPUNET , l.LCCTSOLACE, l.LCCJDELDDE,l.LCCJDEREX, l.LCCTCREP1, l.LCCTCREP2, u.VALIDCOM,u.DELDDEPREC, e.ECCTREFCDE,e.ECCTCODE, e.ECCTNOM, e.ECCTNOMLIV,e.ECCTRUE1LI, e.ECCTRUE2LI,e.ECCTRUE3LI,e.ECCTCPLIV, e.ECCTVILLIV, e.ECCTPAYSLI,LCCTTYPE
from LCOMCLI as l 
join ULCOMCLI as u on u.LCKTSOC=l.LCKTSOC and u.LCKTNUMERO=l.LCKTNUMERO and u.LCKTLIGNE=l.LCKTLIGNE  
right join ECOMCLI as e on e.ECKTSOC=l.LCKTSOC and e.ECKTNUMERO=l.LCKTNUMERO
where l.LCKTSOC='100' and ((l.LCKTNUMERO>'024000' and l.LCKTNUMERO<'100000') or (l.LCKTNUMERO>'500000' and l.LCKTNUMERO<'599999')) and l.LCCTTYPE<>'P' 
and ((LCCTSOLACE<>'S') or (LCCTSOLACE='S' and LCCJDEREX> dateadd(day,-15,getdate()))) and l.LCCTNATURE<>'7' `,

requestMessages = `use ${dbname}
select * from Message`;

const returnRep = async (path: string, next: NextFunction ) => {
    try {
        await pool.connect();
        const result = await pool.request()
        .input('repName', mssql.VarChar, decodeURIComponent(path))
        .query( `use ${dbname} select CTCTUTIL5 from CONTACT where CTKTSOC='100' and CTCTUTIL6= @repName`);
        const ctctutil5 = String(result.recordset[0].CTCTUTIL5.toUpperCase());
        return ctctutil5.split(' ').join('').split(',')
    } catch (err) {
        next(err);
    }
}

