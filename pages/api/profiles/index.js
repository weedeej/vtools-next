import { Instance } from "../../../connection/conn_valcc";
export default async function handler(req, res) {
    if (req.method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });   
    }

    const objInit = new Instance();
    const resp = await objInit.documents();
    if (resp === undefined || resp.length < 1) {
        return res.status(204).end();
    }
    let offset = 0;
    if (req.query.offset != undefined) offset = parseInt(req.query.offset);
    if (offset === NaN) offset = 0;

    res.status(200).json(JSON.stringify(resp.slice(offset,offset+20), null, 4));
}