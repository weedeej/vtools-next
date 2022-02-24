import { Instance } from "../../../../connection/conn_vii";
import { validateAuthorization } from "../../../../utils/validator";
import { initSession } from "../../../../utils/authentication/verify_user";
const axios = require('axios').default;

async function daily(id, req, res)
{
    const instance = new Instance();
    const document = await instance.documentFromID(id);
    if (document === undefined) {
        return res.status(404).json({ error: "Not Found", input: id });
    }

    const reauthResp = await initSession({cookie: document.cookies});
    if (reauthResp.data.type != 'response') return res.status(400).json({ error: "Bad Request", message: reauthResp.data });
    const token = reauthResp.data.response.parameters.uri.split("_token=")[1].split("&")[0];
    const entitlements_token = await validateAuthorization(token, document.puuid);

    if (entitlements_token === false) {
        return res.status(401).json({ error: "Invalid Authorization" });
    }

    const puuid = document.puuid;
    const shard = document.region;
    const headers = {
        authorization: `Bearer ${token}`,
        "x-riot-entitlements-jwt": entitlements_token
    }
    const offersResp = await axios.get(`https://pd.${shard}.a.pvp.net/store/v2/storefront/${puuid}`, {headers})
    .catch(err => { 
        return res.status(400).json(err.response.data)
    })
    if (offersResp.status != 200){
        return res.status(offersResp.status).json({ data: offersResp.data });
    }
    const walletResp = await axios.get(`https://pd.${shard}.a.pvp.net/store/v1/wallet/${puuid}`, {headers})
    .catch(err => {
        return res.status(400).json(err.response.data)
    })
    if (walletResp.status != 200){
        return res.status(walletResp.status).json({ data: walletResp.data });
    }
    // Offers start
    const offers = offersResp.data.SkinsPanelLayout.SingleItemOffers;
    const waitList = document.waitList;
    const offersMap = Object.fromEntries(offers.map(key => [key, true]));
    // Offers end - Wallet start
    const balances = walletResp.data.Balances;
    const valorantPoints = balances["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"]
    const radianitePoints = balances["e59aa87c-4cbf-517a-5983-6e81511be9b7"]
    // Wallet end

    const skinsListResp = await fetch("https://vtools-next.vercel.app/api/skinslist");
    let skinsList = await skinsListResp.json();
    let available = [];
    let offersData = [];

    waitList.map(fav => {if (fav in offersMap){
        available.push(skinsList.data[fav]);
    }return true;})

    offers.map(key => {
        offersData.push(skinsList.data[key])
    })

    res.status(200).json(JSON.stringify({ waitList, offersData, available, wallet: {valorantPoints, radianitePoints} }, null, 4));
}

async function add (id, req, res, skinId)
{
    const instance = new Instance();
    const document = await instance.documentFromID(id);
    if (document === undefined) {
        return res.status(404).json({ error: "Not Found", input: id });
    }
    const waitList = document.waitList;

    const skinsListResp = await fetch("https://vtools-next.vercel.app/api/skinslist");
    let skinsList = await skinsListResp.json();

    if (!(skinId in skinsList.data)) {
        return res.status(404).json({ error: `Skin id: ${skinId} not found`, input: skinId });
    }

    waitList.push(skinId);
    document.waitList = waitList;
    await instance.addDocument(id, document);
    return res.status(200).json({ data: skinsList.data[skinId] });
}

async function remove (id, req, res, skinId)
{
    const instance = new Instance();
    const document = await instance.documentFromID(id);
    if (document === undefined) {
        return res.status(404).json({ error: "Not Found", input: id });
    }
    const waitList = document.waitList;

    if (!waitList.includes(skinId)) {
        return res.status(404).json({ error: `Skin id: ${skinId} not found`, input: skinId });
    }
    for (let i = 0; i < waitList.length; i++) {
        if (waitList[i] == skinId) {
            waitList.pop(i); 
        }
    }

    document.waitList = waitList;
    await instance.addDocument(id, document);
    return res.status(200).json({ data: waitList });
}

export default async function store(req, res) {
    if (req.method != 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });   
    }

    const { id, action, key, updater_id } = req.query;
    if (key == undefined || updater_id == undefined || key != process.env.UPDATER_KEY || !process.env.AUTHORIZED_UPDATER.split("|").includes(updater_id)) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    switch (action[0])
    {
        case 'nightmarket':
            return res.status(404).json({ error: "Not Found", input: action[0] });
        case 'check':
            return daily(id, req, res);
        case 'add':
            if (action[1] == undefined) return res .status(400).json({ error: "Bad Request", message: "No skin ID provided" });
            return add(id, req, res, action[1]);
        case 'remove':
            if (action[1] == undefined) return res .status(400).json({ error: "Bad Request", message: "No skin ID provided" });
            return remove(id, req, res, action[1]);
        default:
            return res.status(404).json({ error: "Not Found", input: action[0]});
    }
}