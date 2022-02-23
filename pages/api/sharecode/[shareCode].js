import { Instance } from "../../../connection/conn_valcc";
export default async function sharecodeHandler(req, res) {
    const {
      query: { shareCode },
      method,
    } = req;

    if (method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });  
    }
    const objInit = new Instance();
    
    let resp = await objInit.documentFromSharecode(shareCode);
    if (resp === undefined || resp.length < 1) {
        return res.status(404).json({ error: "Not Found", input: shareCode });
    }
    res.status(200).json(JSON.stringify(resp, null, 4));
  }