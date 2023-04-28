
interface Expedition {
    dateExp? : string | null;
    dejaExp? : number;
}

export default interface Article {
    ligne : string;
    code : string;
    quantite : number;
    delai? : string | null;
    precedent? : string | null;
    expedition? : Expedition;
    valid: boolean;
}