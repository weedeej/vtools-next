import { Instance } from "../../../connection/conn_vii";

export default async function users(req, res) {
    const { key, updater_id } = req.query;
    if (req.method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    if (key == undefined || updater_id == undefined || key != process.env.UPDATER_KEY || !process.env.AUTHORIZED_UPDATER.split("|").includes(updater_id)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    const instance = new Instance();
    res.status(200).json({data:await instance.getDocuments()});
}