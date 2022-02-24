const fs = require('fs');

export default async function readSkins(req, res) {
    const file = await fetch("https://raw.githubusercontent.com/weedeej/vtools-next/main/pages/api/skinslist/Purchaseables.json", {method: 'GET'});
    if (Object.keys(req.query).length === 0) return res.status(200).json(await file.json());
    return res.status(200).send(await file.json());
}