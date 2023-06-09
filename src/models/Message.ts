interface Contact {
    firstName : string | undefined;
    lastName : string | undefined;
}

export default interface Message {
    createdAt: Date;
    message: string;
    isRead: boolean;
    spAccount: string;
    cde: string;
    rep: string;
    contact?: Contact;
    pbDelai: boolean;
}