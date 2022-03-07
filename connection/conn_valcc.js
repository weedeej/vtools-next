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
        let col;
        const query = { sharecode: shareCode };
        try {
            await this.client.connect();
            const db = this.client.db(this.dbname);
            col = db.collection(this.col_name);
            cursor = col.find(query);
        }finally
        {
            if ((await col.countDocuments(query, {skip: offset, limit:20})) === 0) return docs;
            docs = await cursor.toArray();
            await this.client.close();
            return docs;
        }
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

    async documents(offset)
    {
        let docs = [];
        let cursor;
        let col;
        const query = { shareable: true };
        try {
            await this.client.connect();
            const db = this.client.db(this.dbname);
            col = db.collection(this.col_name);
            cursor = col.find(query).skip(offset).limit(20);
        }finally
        {
            if ((await col.countDocuments(query, {skip: offset, limit:20})) === 0) return docs;
            docs = await cursor.toArray();
            await this.client.close();
            return docs;
        }
        
    }
}