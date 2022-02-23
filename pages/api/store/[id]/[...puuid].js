import { Instance } from "../../../connection/conn_vii";
const axios = require('axios').default;
const { Agent } = require('https');

export default async function store(req, res) {
    if (req.method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });   
    }

    const { id, puuid } = req.query;

    if (!("Authorization" in req.headers)) {
        return res.status(401).json({ error: "Missing Authorization" });
    }else if (!("X-Riot-Entitlements-JWT" in req.headers)) {
        return res.status(401).json({ error: "Missing Entitlements" });
    }

}