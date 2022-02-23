import { initializeApp } from "firebase/app";
import { getFirestore, setDoc, doc, Firestore, getDoc, getDocsFromServer, collection, query as findFrom, where, getDocFromServer } from 'firebase/firestore';

const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);

export class Instance
{
    constructor()
    {
        const app = initializeApp(firebaseConfig);
        this.instance = getFirestore(app);
        this.collection = collection(this.instance, "users-settings");
    }

    async documentFromSharecode (shareCode)
    {
        const query = findFrom(this.collection, where("sharecode", "==", shareCode));
        return (await getDocsFromServer(query)).docs.map(doc => doc.data());
    }

    async documentFromSubject (subject)
    {
        return (await getDocFromServer(doc(this.instance, "users-settings", subject))).data();
    }

    addDocument (docuName, data)
    {
        setDoc(doc(this.instance, "users-settings", docuName), data);
        return data;
    }

    async documents()
    {
        const query = findFrom(this.collection, where("shareable", "==", true));
        return (await getDocsFromServer(query)).docs.map(doc => doc.data());
    }
}