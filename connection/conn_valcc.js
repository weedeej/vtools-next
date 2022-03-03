import { MongoClient, ServerApiVersion } from "mongodb";
const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG);
const uri = process.env.CONNECTION_URI_VALCC;
export class Instance
{
    constructor()
    {
        this.client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
        const [db,coll] = process.env.CONNECTION_DB_COL_VALCC.split(':');
        this.dbname = db;
        this.col_name = coll;
    }

    async documentFromSharecode (shareCode)
    {   
        let docs = [];
        let cursor;
        try {
            await this.client.connect();
            const db = this.client.db(this.dbname);
            const col = db.collection(this.col_name);
            const query = { sharecode: shareCode };
            cursor = col.find(query);
        }finally
        {
            await this.client.close();
        }
        if ((await cursor.count()) === 0) return docs;
        return await cursor.toArray();
    }

    async documentFromSubject (subject)
    {
        let doc;
        try {
            await this.client.connect();
            const db = this.client.db(this.dbname);
            const col = db.collection(this.col_name);
            const query = { subject };
            doc = await col.findOne(query);
        }finally
        {
            await this.client.close();
        }
        return doc ? doc : undefined;
    }

    async addDocument (docuName, data)
    {
        data["subject"] = docuName;
        let res;
        try {
            await this.client.connect();
            const db = this.client.db(this.dbname);
            const col = db.collection(this.col_name);
            const query = { subject: docuName };
            const update = {
                $set: {
                    ...data
                },
              };
            res = await col.updateOne(query, update, { upsert: true });
        }finally
        {
            await this.client.close();
        }
        return res;
    }

    async documents()
    {
        let docs = [];
        let cursor;
        try {
            await this.client.connect();
            const db = this.client.db(this.dbname);
            const col = db.collection(this.col_name);
            const query = { shareable: true };
            cursor = col.find(query);
        }finally
        {
            await this.client.close();
        }
        if ((await cursor.count()) === 0) return docs;
        return await cursor.toArray();
    }
}