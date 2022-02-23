import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, Firestore, getDoc, getDocsFromServer, collection, query as findFrom, where, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

export class Instance
{
    constructor()
    {
        const app = initializeApp(firebaseConfig);
        this.instance = getFirestore(app);
        this.collection = collection(this.instance, "vii-chan_users");
    }

    async documentFromID (id)
    {
        return (await getDocFromServer(doc(this.instance, "vii-chan_users", id))).data();
    }

    addDocument (docuName, data)
    {
        setDoc(doc(this.instance, "vii-chan_users", docuName), data);
        return data;
    }
}