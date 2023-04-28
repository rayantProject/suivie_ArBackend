import Message from './Message';

import Article  from './Article';


interface address{
    street2: string|null;
    street3 : string|null;
    livName : string|null;
    city: string|null;
    zip: string|null;
    country: string|null;
    tel: string|null;
}

export default interface Commande {
    cde: string;
    reference: string;
    client: string;
    address: address;
    rep2?: string|null;
    articles : Array<Article>;
}


