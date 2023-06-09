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
        const ctctutil5 = String(result.recordset[0].CTCTUTIL5.toUpperCase());
        return ctctutil5.split(' ').join('').split(',')
    } catch (err) {
        next(err);
}
}

export const getCommandeByRep = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const reps = await returnRep(req.params.user, next);
        if (reps == undefined || reps.length === 0) 
        {
            error401(req, res);
        } else {
        const result = ((reps.length === 1) && (reps[0] === '*' || reps[0] === 'Tous' || reps[0] === 'tous' || reps[0] === 'TOUS')) ?
        await pool.request().query(request) :
        await pool.request()
        // .query(request+` and l.LCCTCREP1 in (${reps.map((v: string) => `'${v}'`).join(',')}) `)
        .query(request+` and ((l.LCCTCREP1 in (${reps.map((v: string) => `'${v}'`).join(',')}) and l.LCCTCREP1 not in ('GA','GC')) or l.LCCTCREP2 in (${reps.map((v: string) => `'${v}'`).join(',')})) `)
       
        res.status(200).send(transformRequestToCommandeByReps(result.recordset));

        }
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


// ALTER TABLE nom_de_la_table

// ADD CONSTRAINT DF_nom_de_la_colonne DEFAULT (nouvelle_valeur_par_defaut) FOR nom_de_la_colonne;
// (async () => { 
//     try {
//         await pool.connect();
//         const result = await pool.request().query(
//             `
//             use ${dbname}
//             ALTER TABLE MESSAGES
//             ADD CONSTRAINT CREATED_AT DEFAULT  SYSUTCDATETIME() FOR CREATED_AT;
//             ;
//             `
//         );
//        console.table(result.recordset);
//     } catch (err) {
//         console.error(err);
//     }
// })();
// (async () => { 
//     try {
//         await pool.connect();
//         const result = await pool.request().query(
//             `use ${dbname}
//             SELECT 
//                 column_name,
//                 data_type,
//                 character_maximum_length,
//                 is_nullable,
//                 column_default
//             FROM 
//                 information_schema.columns
//             WHERE 
//                 table_name = 'MESSAGES';
//             `


//         );
//        console.table(result.recordset);
//     } catch (err) {
//         console.error(err);
//     }
// })();
interface IVersion {
    goodVersion: string;
    status: | 'ok' | 'warning' | 'error';
    why? : string;

}
const goodVersion = "2.0.1.0";
export const getVersion = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const spVersion = req.params.spVersion
        .split('.').length === 4 ? req.params.spVersion.split('.') : ['0','0','0','0'];
        const goodVersionSplit = goodVersion.split('.');
        let status: 'ok' | 'warning' | 'error' = 'ok';
        if (spVersion[0] !== goodVersionSplit[0]) status = 'error';
        else if (spVersion[1] !== goodVersionSplit[1]) status = 'warning';
        else if (spVersion[2] !== goodVersionSplit[2]) status = 'warning';
        else if (spVersion[3] !== goodVersionSplit[3]) status = 'warning';
        const version: IVersion = {
            goodVersion,
            status,
            why: status === 'ok' ? undefined : `La version de votre application est ${req.params.spVersion} et la version de l'api est ${goodVersion}`
        }
        res.status(200).send(version);
    } catch (err) {
        next(err);
    }
}