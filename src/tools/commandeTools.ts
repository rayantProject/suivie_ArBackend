import Commande from "src/models/Commande";
import CommandeByRep from "src/models/CommandeByRep";
import Article from "src/models/Article";


interface requestResult {
    LCKTNUMERO: string;
    LCCTCREP2: string | null;
    LCCTCREP1: string ;
    LCCJDELDDE: string | null;
    LCCJDEREX: string | null;
    LCCNQTECDE: string;
    LCCNQTEEXP: number;
    LCCNPUNET: string;
    LCCTCOMART: string | null;
    LCCTCODART: string;
    LCKTLIGNE: string;
    LCCTSOLACE: string | null;
    LCCTTYPE: string;
    ECCTCODE: string;
    ECCTNOM: string;
    ECCTNOMLIV: string;
    ECCTRUE1LI: string;
    ECCTRUE2LI: string | null;
    ECCTRUE3LI: string | null;
    ECCTCPLIV: string;
    ECCTVILLIV: string;
    ECCTPAYSLI: string;
    VALIDCOM: string;
    DELDDEPREC: string | null;
    ECCTREFCDE: string;

}


interface MapOfRequestResult {
    cde: string;
    reference: string;
    client: string;
    valid: boolean;
    repName: string|null;
    address : {
        tel: string | null;
        city: string | null;
        zip: string | null;
        country: string | null;
        street2: string | null;
        street3: string | null;
        livName: string | null;
    };
    article: {
        ligne: string;
        code: string;
        quantite: number;
        delai: string | null;
        precedent: string | null;
        expedition: {
            dateExp: string | null;
            dejaExp: number;
        };
    };
}
/*
  request :
    select l.LCKTNUMERO, l.LCKTLIGNE, l.LCCTCODART, l.LCCTCOMART, l.LCCNQTECDE, l.LCCNQTEEXP, l.LCCNPUNET , l.LCCTSOLACE, l.LCCJDELDDE,l.LCCJDEREX, l.LCCTCREP1, l.LCCTCREP2,
u.VALIDCOM,u.DELDDEPREC,e.ECCTREFCDE,e.ECCTCODE, e.ECCTNOM, e.ECCTNOMLIV,e.ECCTRUE1LI, e.ECCTRUE2LI,e.ECCTRUE3LI,e.ECCTCPLIV, e.ECCTVILLIV, e.ECCTPAYSLI,LCCTTYPE
from LCOMCLI as l 
join ULCOMCLI as u on u.LCKTSOC=l.LCKTSOC and u.LCKTNUMERO=l.LCKTNUMERO and u.LCKTLIGNE=l.LCKTLIGNE  
right join ECOMCLI as e on e.ECKTSOC=l.LCKTSOC and e.ECKTNUMERO=l.LCKTNUMERO
where l.LCKTSOC='100' and u.VALIDCOM=1 and ((l.LCKTNUMERO>'024000' and l.LCKTNUMERO<'100000') or (l.LCKTNUMERO>'500000' and l.LCKTNUMERO<'599999')) and l.LCCTTYPE<>'P' 
and ((LCCTSOLACE<>'S') or (LCCTSOLACE='S' and LCCJDEREX> dateadd(day,-15,getdate()))) `

 */

export default function transformRequestToCommandeByReps(request: any): Array<CommandeByRep> {
    // const commandesByReps: Array<CommandeByRep> = [],

    return request.map((item: requestResult) => {
        const rep= (item.LCCTCREP1 !== null) ? item.LCCTCREP1.split(" ").join('') == "" ? null : item.LCCTCREP1 : null,
            rep2= (item.LCCTCREP2 !== null) ? item.LCCTCREP2.split(" ").join('') == "" ? null : item.LCCTCREP2 : null

        const commande: MapOfRequestResult = {
            cde: item.LCKTNUMERO,
            reference: item.ECCTREFCDE,
            client: item.ECCTNOM,
            valid: item.VALIDCOM >= "1"  ? true : false,
            repName: (!!rep2 && rep2 !== "" && rep2 !== " ")  ? rep2 : rep,
            address : {
                tel: (item.ECCTRUE1LI  !== null) ? item.ECCTRUE1LI.split(" ").join('') == "" ? null : item.ECCTRUE1LI : null  ,
                city: (item.ECCTVILLIV !== null) ? item.ECCTVILLIV.split(" ").join('') == "" ? null : item.ECCTVILLIV : null,
                zip: (item.ECCTCPLIV !== null) ? item.ECCTCPLIV.split(" ").join('') == "" ? null : item.ECCTCPLIV : null,
                country: (item.ECCTPAYSLI !== null) ? item.ECCTPAYSLI.split(" ").join('') == "" ? null : item.ECCTPAYSLI : null,
                street2: (item.ECCTRUE2LI !== null) ? item.ECCTRUE2LI.split(" ").join('') == "" ? null : item.ECCTRUE2LI : null,
                street3: (item.ECCTRUE3LI !== null) ? item.ECCTRUE3LI.split(" ").join('') == "" ? null : item.ECCTRUE3LI : null,
                livName: (item.ECCTNOMLIV !== null) ? item.ECCTNOMLIV.split(" ").join('') == "" ? null : item.ECCTNOMLIV : null,
            },
            article:{
                ligne: item.LCKTLIGNE,
                code: item.LCCTCODART,
                delai: (item.LCCJDELDDE !== null) ? item.LCCJDELDDE.split(" ").join('') == "" ? null : item.LCCJDELDDE.split(" ").join('')  : null,
                precedent: (item.DELDDEPREC !== null) ? item.DELDDEPREC.split(" ").join('') == "" ? null : item.DELDDEPREC.split(" ").join('') : null,
                quantite: Number(item.LCCNQTECDE),
                expedition: {
                    dejaExp: Number(item.LCCNQTEEXP),
                    // date: item.LCCJDEREX,
                    dateExp: (item.LCCJDEREX  !== null) ? item.LCCJDEREX.split(" ").join('') == "" ? null : item.LCCJDEREX.split(" ").join('') : null,
                }
            }
    }
    return commande
}).reduce((acc: Array<CommandeByRep>, item: MapOfRequestResult) => {
    const repName = item.repName
    const index = acc.findIndex((item) => item.repName === repName)
    if (index === -1) {
        acc.push({
            repName: repName? repName : "Sans Rep",
            commandes: []
        })
    }

    if (index !== -1) {
        acc[index].commandes.push(
            {
                cde: item.cde,
                reference: item.reference,
                client: item.client,
                valid: item.valid,
                address: item.address,
                articles: []
            }
        )

        const index2 = acc[index].commandes.findIndex((item) => item.cde === item.cde)
        if (index2 !== -1) {
            acc[index].commandes[index2].articles.push(
                {
                    ligne: item.article.ligne,
                    code: item.article.code,
                    quantite: item.article.quantite,
                    delai: item.article.delai,
                    precedent: item.article.precedent,
                    expedition: {
                        dateExp: item.article.expedition.dateExp,
                        dejaExp: item.article.expedition.dejaExp
                    }
                }
            )
        }
    }

    return acc

}, [])
}   