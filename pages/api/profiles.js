import { Instance } from "../../connection/conn";
export default async function handler(req, res) {
    if (req.method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });   
    }

    const objInit = new Instance();
    const resp = await objInit.documents();
    if (resp === undefined) {
        return res.status(204).end();
    }
    res.status(200).json(resp);
}