import { Instance } from "../../../../connection/conn";
import validate from "../../../../utils/validator";

export default async function queryHandler(req, res) {
    const { puuid, actions:actions } = req.query;
    const method = req.method;
    const action = actions[0];
    switch (action) {
        case "fetch":
            if (method != 'GET') {
                res.setHeader('Allow', ['GET']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });  
            }
            const objInit = new Instance();
            const data = await objInit.documentFromSubject(puuid);
            if (data === undefined)
            { return res.status(404).json({ error: "Not Found" }); }
            return res.status(200).json(data);

        case "set":
            const { body, headers } = req;
            if (method != 'PUT') {
                res.setHeader('Allow', ['PUT']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });  
            }
            
            // Body Validation block start
            const validation = await validate(body, headers, puuid);
            if (validation[0] !== 200) {
                return res.status(validation[0]).json(validation[1]);
            }
            // Body Validation block end
            res.end("test");
            break;
        default:
            return res.status(404).json({ error: "Not Found" });
    }
}   