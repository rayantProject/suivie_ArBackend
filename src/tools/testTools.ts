import Commande from "src/models/Commande";
import CommandeByRep from "src/models/CommandeByRep";
import Message from 'src/models/Message';

interface commandRequestResult {
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

interface MessageRequestResult {
    CREATED_AT : Date;
    MESSAGE_TEXT: string;
    IS_READ : string;
    SHP_LOGIN: string;
    LCKTNUMERO : string;
    REPRESENTANT : string;
    CTCTPRENOM: string  | null;
    CTCTNOM: string | null;
}

interface MapOfRequestResult {
    cde: string;
    reference: string;
    client: string;
    rep2?: string | null;
    repName: string;
    messages: Message[];
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
        valid: boolean;
        quantite: number;
        delai: string | null;
        precedent: string | null;
        expedition: {
            dateExp: string | null;
            dejaExp: number;
        };
    };
}

export default (reqCommandes: commandRequestResult[], reqMessages: MessageRequestResult[]): CommandeByRep[]  => {
    const commandesByReps: Array<CommandeByRep> = [],
    messages: Message[] = reqMessages.map((message: MessageRequestResult) => {
        return {
            createdAt: message.CREATED_AT,
            message: message.MESSAGE_TEXT,
            isRead: Number(message.IS_READ) === 1 ? true : false,
            spAccount : message.SHP_LOGIN.trim(),
            cde : String(message.LCKTNUMERO),
            rep : message.REPRESENTANT,
            contact : {
                firstName : message.CTCTNOM !== undefined ? message.CTCTNOM?.trim() : undefined,
                lastName : message.CTCTPRENOM !== undefined  ? message.CTCTPRENOM?.trim() : undefined
            }
        };
        }
    ), mapOfRequestResult: MapOfRequestResult[] = reqCommandes.map((item: commandRequestResult) => {
        return {
            cde: item.LCKTNUMERO,
            reference: item.ECCTREFCDE.trim(),
            client: item.ECCTNOM.trim(),
            rep2 : (item.LCCTCREP2 !== null) ? item.LCCTCREP2.split(" ").join('') == "" ? null : item.LCCTCREP2 : null,
            repName:  item.LCCTCREP1.trim(),
            // repName: rep,
            messages: messages.filter((message: Message) => Number(message.cde) === Number(item.LCKTNUMERO)),
            
            address : {
                tel: (item.ECCTRUE1LI  !== null) ? item.ECCTRUE1LI.split(" ").join('') == "" ? null : item.ECCTRUE1LI.trim() : null  ,
                city: (item.ECCTVILLIV !== null) ? item.ECCTVILLIV.split(" ").join('') == "" ? null : item.ECCTVILLIV.trim() : null,
                zip: (item.ECCTCPLIV !== null) ? item.ECCTCPLIV.split(" ").join('') == "" ? null : item.ECCTCPLIV.trim() : null,
                country: (item.ECCTPAYSLI !== null) ? item.ECCTPAYSLI.split(" ").join('') == "" ? null : item.ECCTPAYSLI.trim() : null,
                street2: (item.ECCTRUE2LI !== null) ? item.ECCTRUE2LI.split(" ").join('') == "" ? null : item.ECCTRUE2LI.trim() : null,
                street3: (item.ECCTRUE3LI !== null) ? item.ECCTRUE3LI.split(" ").join('') == "" ? null : item.ECCTRUE3LI.trim() : null,
                livName: (item.ECCTNOMLIV !== null) ? item.ECCTNOMLIV.split(" ").join('') == "" ? null : item.ECCTNOMLIV.trim() : null,
            },
            article:{
                valid: item.VALIDCOM >= "1"  ? true : false,
                ligne: item.LCKTLIGNE,
                code: item.LCCTCODART.trim(),
                delai: (item.LCCJDELDDE !== null) ? item.LCCJDELDDE.split(" ").join('') == "" ? null : item.LCCJDELDDE.split(" ").join('')  : null,
                precedent: (item.DELDDEPREC !== null) ? item.DELDDEPREC.split(" ").join('') == "" ? null : item.DELDDEPREC.split(" ").join('') : null,
                quantite: Number(item.LCCNQTECDE),
                expedition: {
                    dejaExp: Number(item.LCCNQTEEXP),
                    // date: item.LCCJDEREX,
                    dateExp: (item.LCCJDEREX  !== null) ? item.LCCJDEREX.split(" ").join('') == "" ? null : item.LCCJDEREX.split(" ").join('') : null,
                }
            }

        };
    });

    mapOfRequestResult.forEach((element: MapOfRequestResult ) => {
        
        const index = commandesByReps.findIndex((item: CommandeByRep) => item.repName === element.repName), 
        {repName, article, ...commande} = element
        if (index === -1) {
            commandesByReps.push({
                repName: repName,
                commandes: [
                    {
                        ...commande,
                        articles: [article]
                    }
                ]
            })
        }else{
            const index2 = commandesByReps[index].commandes.findIndex((item: Commande) => item.cde === element.cde)
            if (index2 === -1) {
                commandesByReps[index].commandes.push({
                    ...commande,
                    articles: [article]
                })
            }else{
                commandesByReps[index].commandes[index2].articles.push(article)
            }
        }
    });
    
    return commandesByReps.sort((a:CommandeByRep, b: CommandeByRep) => a.repName.localeCompare(b.repName))
}