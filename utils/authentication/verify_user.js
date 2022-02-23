const axios = require('axios').default;
const { Agent } = require('https');

const ciphers = [
    'TLS_CHACHA20_POLY1305_SHA256',
    'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
    'TLS_AES_128_GCM_SHA256',
    'TLS_AES_256_GCM_SHA384',
];

const httpAgent = new Agent({ ciphers: ciphers.join(':'), honorCipherOrder: true, minVersion: 'TLSv1.2' })
const authRiotInstance = axios.create({
    baseURL: 'https://auth.riotgames.com',
    timeout: 1500,
    httpsAgent: httpAgent,
    withCredentials: true,
  });

export async function initSession(cookieHeaders = null) {
    const sessionReq = await authRiotInstance.post("/api/v1/authorization",
    {
        client_id: "play-valorant-web-prod",
        nonce: 1,
        redirect_uri: "https://playvalorant.com/opt_in",
        response_type: "token id_token",
        scope: "account openid"
    }, {headers: cookieHeaders ? cookieHeaders: {}})
    return sessionReq
}

async function authorize(username = null, password = null, code = null, cookies = null)
{
    let cooked;
    let payload;
    if (code == null)
    {
        let cookiesRaw = await initSession()
        cookiesRaw = cookiesRaw.headers['set-cookie']
        cooked = {Cookie: cookiesRaw.join(";")}
        payload = {
            type:"auth",
            username,
            password,
            remember:true}
    }else
    {
        cooked = {cookie: `ssid=${cookies.ssid}; tdid=${cookies.tdid}; asid=${cookies.asid}; clid=${cookies.clid}`}
        payload = { type: "multifactor", code: code.trim(), rememberDevice: true }
    }
    const resp = await authRiotInstance.put("/api/v1/authorization", payload, {headers:cooked}).catch( (err) => 
    {
        if (err.response === undefined) return err;
        return err.response
    })
    return resp
}


export default async function obtainSession(username = null, password = null, code = null, cookies = null) {
    let authResponse;
    if (code != null)
    {
        authResponse = await authorize(null, null, code, cookies)
    }else {
        authResponse = await authorize(username, password)
    }
    if (authResponse.data == undefined)
    {
        return {
            success: false,
            type: 'error',
            email: '',
            message: 'Unknown error. Error has been logged.',
            cookies: '',
            response: ""
        }
    }
    console.log(authResponse)
    const responseHeaders = authResponse.headers
    const cookiesRaw = responseHeaders['set-cookie']
    let cooked = {};
    cookiesRaw.forEach( (cookie) => {
        let [key, value] = cookie.split("=")
        cooked[key] = value
    });
    if (cookiesRaw === undefined) { 
        return {
            success: false,
            type: 'error',
            email: '',
            message: 'API is being rate limited!',
            cookies: '',
            response: authResponse.data
        }
    }
    if (authResponse.data.type == "multifactor") {
        return {
            success: false,
            type: 'multifactor',
            email: authResponse.data.multifactor.email,
            message: 'Multifactor Authentication Required',
            cookies: cooked,
            response: authResponse.data
        }
    }

    if (authResponse.data.type == "auth") {
        return {
            success: false,
            type: 'auth',
            email: '',
            message: authResponse.data.error,
            cookies: cookiesRaw.join(";"),
            response: authResponse.data
        }
    }

    if (authResponse.data.type == "error") {
        return {
            success: false,
            type: 'error',
            email: '',
            message: authResponse.data.error,
            cookies: cookiesRaw.join(";"),
            response: authResponse.data
        }
    }

    return {
        success: true,
        type: 'response',
        email: '',
        message: 'Authentication is successful!',
        cookies: cookiesRaw.join(";"),
        response: authResponse.data
    }
}