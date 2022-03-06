export default async function getVersion(req, res) {
    const file = await fetch(`https://gist.githubusercontent.com/weedeej/${process.env.GITHUB_PURCHASEABLES_GIST}/raw/Purchaseables.json`);
    if (Object.keys(req.query).length === 0) return res.status(200).json(JSON.stringify({riotClientVersion: (await file.json()).riotClientVersion}, null, 4));
    res.setHeader('Content-disposition', 'attachment; filename=Purchaseables.json');
    return res.status(200).send(file.body);
}