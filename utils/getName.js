export default async function fetchName(puuid) {
    const body = await fetch(`https://pd.na.a.pvp.net/name-service/v2/players`, { method: "PUT", body: `["${puuid}"]` })
        .then((res) => { return res.json(); });
    return body;
}