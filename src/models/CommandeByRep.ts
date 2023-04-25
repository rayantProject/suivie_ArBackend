import Commande from "./Commande";

export default interface CommandeByRep {
    repName: string;
    commandes: Array<Commande>;
}