export default interface Message {
    createdAt: Date;
    message: string;
    isRead: boolean;
    spAccount: string;
    cde: string;
    rep: string;
}