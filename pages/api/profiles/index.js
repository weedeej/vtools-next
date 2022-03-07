import { Instance } from "../../../connection/conn_valcc";
export default async function handler(req, res) {
    if (req.method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });   
    }
    
    let offset = 0;
    if (req.query.offset != undefined) offset = parseInt(req.query.offset);
    if (offset === NaN) offset = 0;

    const objInit = new Instance();
    const resp = await objInit.documents(offset);
    if (resp === undefined || resp.length < 1) {
        return res.status(204).end();
    }

    res.status(200).json(JSON.stringify(resp, null, 4));
}