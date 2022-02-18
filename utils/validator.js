export default async function validate(body, headers, puuid) {
    const {settings, sharecode, shareable } = body;
    if (!(settings && sharecode) || typeof shareable === 'undefined')
    { return [400,{ error: "Bad Request", message: "Bad JSON body." }]; }

    if (!headers || !headers.authorization)
    { return [400,{ error: "Bad Request", message: "Missing Authorization Header" }]; }
    
    const isHeaderValid = await fetch("https://entitlements.auth.riotgames.com/api/token/v1", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": headers.authorization,
            "User-agent": "RiotClient/43.0.1.4195386.4190634 rso-auth (Windows; 10;;Professional, x64)" }
    }).then(async (res) => 
    {
        if (res.status != 200) return false;
        const resp = await res.json();
        const entitlements = new Buffer(resp.entitlements_token.split(".")[1], "base64").toString("utf8");
        if (JSON.parse(entitlements).sub == puuid) return true;
        return false;
    });
    if (!isHeaderValid) return [400,{ error: "Bad Request", message: "Invalid PUUID/Authorization Header" }];
    return [200,{ error: "OK", message: "Valid" }];
}