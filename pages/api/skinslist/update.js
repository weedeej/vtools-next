import { Instance } from "../../../connection/conn_vii";
import { initSession } from "../../../utils/authentication/verify_user";
import { validateAuthorization } from "../../../utils/validator";
const axios = require('axios').default;
const fs = require('fs');

export default async function update(req, res) {
    const {query: {key, id}} = req;
    if (key == undefined || key != process.env.UPDATER_KEY || id == undefined || !process.env.AUTHORIZED_UPDATER.split("|").includes(id)) {
        return res.status(401).json({ error: "Invalid Credentials" });
    }
    const instance = new Instance();
    const document = await instance.documentFromID(id);
    const reauthResp = await initSession({cookie: document.cookies});
    if (reauthResp.data.type != 'response') return res.status(400).json({ error: "Bad Request", message: reauthResp.data });
    const token = reauthResp.data.response.parameters.uri.split("_token=")[1].split("&")[0];
    const entitlements_token = await validateAuthorization(token, document.puuid);
    const headers = {
        authorization: `Bearer ${token}`,
        accept: 'application/json',
        "x-riot-entitlements-jwt": entitlements_token
    }

    const offersResp = await axios.get(`https://pd.${document.region}.a.pvp.net/store/v1/offers/`, {headers})
    .catch(err => { 
        return res.status(400).json(err.response.data)
    })
    const versionResp = await axios.get(`https://valorant-api.com/v1/version` );
    const skinlevelsResp = await axios.get(`https://valorant-api.com/v1/weapons/skinlevels`);

    const offers = offersResp.data.Offers;
    const skinlevels = skinlevelsResp.data.data;
    const riotClientVersion = versionResp.data.data.riotClientVersion;
    let buyable = {riotClientVersion, data: {}};

    for (let i = 0; i < skinlevels.length; i++) {
        const skinLevel = skinlevels[i];
        offers.some(offer => {
            if (offer.OfferID == skinLevel.uuid && offer.IsDirectPurchase){
                skinLevel["cost"] = offer.Cost["85ad13f7-3d1b-5128-9eb2-7cd8ee0b5741"];
                const uuid = offer.OfferID;
                buyable.data[uuid] = skinLevel;
            }
        })
    }
    fs.writeFileSync('./pages/api/skinslist/Purchaseables.json', JSON.stringify(buyable, null, 4));
    return res.status(200).json(buyable);
}