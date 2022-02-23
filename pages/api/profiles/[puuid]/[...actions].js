import { Instance } from "../../../../connection/conn_valcc";
import validate from "../../../../utils/validator";
import fetchName from "../../../../utils/getName";

export default async function queryHandler(req, res) {
    const { puuid, actions:actions } = req.query;
    const method = req.method;
    const action = actions[0];
    const objInit = new Instance();
    switch (action) {
        case "fetch":
            if (method != 'GET') {
                res.setHeader('Allow', ['GET']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });  
            }

            const data = await objInit.documentFromSubject(puuid);
            if (data === undefined)
            { return res.status(404).json({ error: "Not Found" }); }
            return res.status(200).json(JSON.stringify(data, null, 4));

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
            let resp = await objInit.documentFromSharecode(body.sharecode);
            if (resp.keys() > 0) {
                return res.status(409).json({ error: "Conflict", message: "Sharecode already exists" });
            }
            // Name fetching block start
            const fromNameService = await fetchName(puuid).then(name => {return name[0]} );
            body.displayName = fromNameService.GameName;
            body.gameTag = fromNameService.TagLine;
            // Name fetching block end

            await objInit.addDocument(puuid, body);
            return res.status(200).json({ status: "OK", message: "Success" });
        default:
            return res.status(404).json({ error: "Not Found" });
    }
}   