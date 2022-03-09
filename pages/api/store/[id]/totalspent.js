import axios from 'axios';
import AbortController from 'axios'
import { Agent } from 'https';
import { Instance } from "../../../../connection/conn_vii";

const ciphers = [
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
];

const httpAgent = new Agent({ ciphers: ciphers.join(':'), honorCipherOrder: true, minVersion: 'TLSv1.2' })

async function get_sso(cookies, res) {
    const first_redirect = await axios.get("https://auth.riotgames.com/authorize?redirect_uri=https://login.playersupport.riotgames.com/login_callback&client_id=player-support-zendesk&ui_locales=en-us%20en-us&response_type=code&scope=openid%20email", {
        headers: {
            cookie: cookies,
            'User-Agent': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)'
        },
        maxRedirects:1,
        httpsAgent: httpAgent,
        withCredentials: true
    }).then((res)=>{
        return res.headers.location
    }).catch((err) => {
        return err.request._currentUrl;
    });
    const second_redirect = await axios.get(await first_redirect, {
        headers: {
            cookie: cookies,
            'User-Agent': 'RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)'
        },
        maxRedirects:0,
        withCredentials: true
    }).catch((err) => {
        if (err.response != undefined)
        {
            return err.response;
        }
    });
    let sso = [];
    try
    {
        sso = second_redirect.headers['set-cookie'].filter(e => e.includes('sso_session'));
    } catch (ex)
    {
        if (ex instanceof TypeError) return res.status(401).json({error:"Your session has expired because you changed password/riot\'s update revoked it."});
        else throw ex;
    }
    
    if (sso.length < 1)
        return res.status(401).json({error:"Your Riot Games email is not Verified. Please go to https://account.riotgames.com and verify your email."});
    
    return sso;
}

export default async function totalspent(req,res)
{
    const { id, key, updater_id } = req.query;
    if (key == undefined || updater_id == undefined || key != process.env.UPDATER_KEY || !process.env.AUTHORIZED_UPDATER.split("|").includes(updater_id)) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    
    const instance = new Instance();
    const document = await instance.documentFromID(id);
    if (document === undefined) {
        return res.status(404).json({ error: "Not Found", input: id });
    }

    const sso = await get_sso(document.cookies,res);
    if (sso === undefined) return;
    const fetch_hist = await axios.get("https://sspd.playersupport.riotgames.com/valorant_purchase_history", {
        headers: {
            cookie: sso
        },

        withCredentials: true,
        })
        .catch( err => {
            return {error: err};
        });
    if (fetch_hist.error !== undefined) return res.status(500).json(fetch_hist.error);

    const response = fetch_hist.data;
    const history = response.account.billing.paymentHistory;
    if (history.length < 1) return res.status(400).json({error:"No payment history found"});
    const currency = history[0].currency;
    let total = 0
    history.map(e => {
         total += parseFloat(e.amount);
    });
    res.status(200).json({currency, total, combined: `${total}${currency}`, history});
}
