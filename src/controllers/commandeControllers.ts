import mssql from 'mssql';
import { Request, Response, NextFunction } from 'express';
import {error401} from 'src/tools/errorHandle';
import config  from 'src/config/db';
import transformRequestToCommandeByReps from 'src/tools/commandeTools';
const pool = new mssql.ConnectionPool(config);
const dbname = process.env.DB_NAME || '';
const request = `use ${dbname}
select l.LCKTNUMERO, l.LCKTLIGNE, l.LCCTCODART, l.LCCTCOMART, l.LCCNQTECDE, l.LCCNQTEEXP, l.LCCNPUNET , l.LCCTSOLACE, l.LCCJDELDDE,l.LCCJDEREX, l.LCCTCREP1, l.LCCTCREP2,
u.VALIDCOM,u.DELDDEPREC, e.ECCTREFCDE,e.ECCTCODE, e.ECCTNOM, e.ECCTNOMLIV,e.ECCTRUE1LI, e.ECCTRUE2LI,e.ECCTRUE3LI,e.ECCTCPLIV, e.ECCTVILLIV, e.ECCTPAYSLI,LCCTTYPE
from LCOMCLI as l 
join ULCOMCLI as u on u.LCKTSOC=l.LCKTSOC and u.LCKTNUMERO=l.LCKTNUMERO and u.LCKTLIGNE=l.LCKTLIGNE  
right join ECOMCLI as e on e.ECKTSOC=l.LCKTSOC and e.ECKTNUMERO=l.LCKTNUMERO
where l.LCKTSOC='100' and ((l.LCKTNUMERO>'024000' and l.LCKTNUMERO<'100000') or (l.LCKTNUMERO>'500000' and l.LCKTNUMERO<'599999')) and l.LCCTTYPE<>'P' 
and ((LCCTSOLACE<>'S') or (LCCTSOLACE='S' and LCCJDEREX> dateadd(day,-15,getdate()))) and l.LCCTNATURE<>'7' `

const returnRep = async (path: string, next: NextFunction ) => {
    try {
        await pool.connect();
        const result = await pool.request()
        .input('repName', mssql.VarChar, decodeURIComponent(path))
        .query( `use ${dbname} select CTCTUTIL4, CTCTUTIL5 from CONTACT where CTKTSOC='100' and CTCTUTIL6= @repName`);
        const ctctutil5 : string = result.recordset[0].CTCTUTIL5.toUpperCase();
        const ctctutil4 : string = result.recordset[0].CTCTUTIL4.toUpperCase();
        return {
            reps: ctctutil5.split(' ').join('').split(','),
            loginRepName: ctctutil4.trim()
        }
        
    } catch (err) {
        next(err);
        return {
            reps: [],
            loginRepName: ''
    }
}
}

export const getCommandeByRep = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const {reps, loginRepName} = await returnRep(req.params.user, next);
        if (reps.length === 0) 
        {
            error401(req, res);
        }
        const result = ((reps.length === 1) && (reps[0] === '*' || reps[0] === 'Tous' || reps[0] === 'tous' || reps[0] === 'TOUS')) ?
        await pool.request().query(request) :
        await pool.request()
        // .query(request+` and l.LCCTCREP1 in (${reps.map((v: string) => `'${v}'`).join(',')}) `)
        .query(request+` and (l.LCCTCREP1 in (${reps.map((v: string) => `'${v}'`).join(',')}) and l.LCCTCREP1 not in ('GA','GC')) or l.LCCTCREP2 in (${reps.map((v: string) => `'${v}'`).join(',')}) `)
        res.status(200).send(
            {
                loginRepName: loginRepName,
                representants: transformRequestToCommandeByReps(result.recordset)
            }
        );

    } catch (err: any) {
        next(err);
    }
}


export const getRepLoginName = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {loginRepName} = await returnRep(req.params.user, next);
        res.status(200).send(loginRepName);
    } catch (err: any) {
        next(err);
    }
}

export const downloadAr = async (req: Request, res: Response, next: NextFunction) => {
    // mount -t cifs  //192.168.100.27/pmisoft/SuiviAR /mnt/sharedDir/ -o username=Info,password=Info22!
try{
            var file = `/mnt/sharedDir/AR${req.params.cde}.pdf`;
            res.download(file);

    }catch(err: any){
        next(err);
}

}

export const updateDelaiprec = async (req: Request, res: Response, next: NextFunction) => {
    try{
        const {cde} = req.body;
        await pool.connect();
        const result = await pool.request()
        .input('cde', mssql.VarChar, cde)
        .query(`use ${dbname} 
        update ULCOMCLI
        set ULCOMCLI.DELDDEPREC=LCOMCLI.LCCJDELDDE
        from ULCOMCLI join LCOMCLI on ULCOMCLI.LCKTNUMERO=LCOMCLI.LCKTNUMERO and ULCOMCLI.LCKTLIGNE=LCOMCLI.LCKTLIGNE where ULCOMCLI.VALIDCOM='1'
        and ULCOMCLI.LCKTNUMERO=@cde
`);
        res.status(200).send(
            {
                message: 'date udpated'
            }
        );

    }catch(err: any){
        next(err);
    }
}

