export async function validateAuthorization(authorization, puuid) {
    const entitlementsRequest = await fetch("https://entitlements.auth.riotgames.com/api/token/v1", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${authorization}`,
            "User-agent": "RiotClient/60.0.3.4751956.4749685 %s (Windows;10;;Professional, x64)" }
    });
    return entitlementsRequest.ok ?
        await getAuthValidationResponse(entitlementsRequest, puuid) :
        false;
}

export async function validate(body, headers, puuid) {
    const {settings, sharecode, shareable } = body;
    if (!(settings && sharecode) || typeof shareable === 'undefined')
    { return [400,{ error: "Bad Request", message: "Bad JSON body." }]; }

    if (!headers || !headers.authorization)
    { return [400,{ error: "Bad Request", message: "Missing Authorization Header" }]; }
    
    const entitlementsRequest = await fetch("https://entitlements.auth.riotgames.com/api/token/v1", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": headers.authorization,
            "User-agent": "RiotClient/60.0.3.4751956.4749685 %s (Windows;10;;Professional, x64)" }
    });
    return entitlementsRequest.ok ?
        getFinalResponse(entitlementsRequest, puuid)  :
        [500,{ error: "External Error", message: "Client API Error occured" }];
}

async function getFinalResponse(entitlementsRequest, puuid) {
    const resp = await entitlementsRequest.json();
    const entitlements = new Buffer(resp.entitlements_token.split(".")[1], "base64").toString("utf8");
    return (JSON.parse(entitlements).sub == puuid) ?
        [200,{ error: "OK", message: "Valid" }] :
        [400,{ error: "Bad Request", message: "Invalid PUUID/Authorization Header" }]
}

async function getAuthValidationResponse(entitlementsRequest, puuid) {
    const resp = await entitlementsRequest.json();
    const entitlements = new Buffer(resp.entitlements_token.split(".")[1], "base64").toString("utf8");
    return (JSON.parse(entitlements).sub == puuid) ?
        resp.entitlements_token :
        false
}