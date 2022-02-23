import { Instance } from "../../../connection/conn_vii";
import obtainSession from "../../../utils/authentication/verify_user";
import initSession from "../../../utils/authentication/verify_user";
import Cookies from 'cookies';

export default async function handler(req, res) {
    if (req.method != 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json(JSON.stringify({ error: `Method ${req.method} Not Allowed` }));   
    }
    let body;
    try 
    {
        body = JSON.parse(req.body);
    }catch
    {
        body = req.body;
    }
    let { id, username, password, region, code } = body;
    const cookiesInstance = new Cookies(req, res) // Cookies instance

    let try_auth;
    if ( code != undefined)
    {
        try_auth = await obtainSession(null, null, code, req.cookies);
        id = cookiesInstance.get('id');
    }else
    {
        if (!id || !username || !password || !region === 'undefined') return res.status(400).json(JSON.stringify({ error: "Bad Request", message: "Bad JSON body." }));
        try_auth = await obtainSession(username, password);
    }

    switch(try_auth.type) {
        case 'error':
            return res.status(429).json(JSON.stringify({ type: 'error', error: "Bad Request", message: try_auth.message, session: try_auth.cookies }));
        case 'multifactor':
            cookiesInstance.set('tdid', try_auth.cookies.tdid, { httpOnly: false});
            cookiesInstance.set('asid', try_auth.cookies.asid, { httpOnly: false});
            cookiesInstance.set('clid', try_auth.cookies.clid, { httpOnly: false});
            cookiesInstance.set('region', region, { httpOnly: false});
            cookiesInstance.set('id', id, { httpOnly: false});
            cookiesInstance.set('mfa_email', try_auth.email, { httpOnly: false});
            res.setHeader('Location','/auth/mfa');
            return res.status(400).json(JSON.stringify({ type: 'multifactor', error: "Bad Request", message: "Multifactor Authentication Required", session: try_auth.cookies }));
        case 'auth':
            res.setHeader('Location','/auth/mfa');
            return res.status(401).json(JSON.stringify({ type: 'auth', error: try_auth.message, message: "Invalid username or password.", session: try_auth.cookies }));
        case 'response':
            const conn_vii = new Instance();
            const currentDocument = await conn_vii.documentFromID(id);
            if (currentDocument === undefined) {
                await conn_vii.addDocument(id, {region: region, cookies: try_auth.cookies, waitList: []});
            }else
            {
                region = code? cookiesInstance.get('region') : region;
                await conn_vii.addDocument(id, {region: region, puuid: try_auth.cookies.split("sub=")[1].split(";")[0], cookies: try_auth.cookies, waitList: currentDocument.waitList});
            }
            return res.status(200).json(JSON.stringify(try_auth, null, 4));
        default:
            return res.status(204);
    }
}