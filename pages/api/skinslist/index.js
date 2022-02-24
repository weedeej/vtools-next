const fs = require('fs');

export default async function readSkins(req, res) {
    const file = fs.readFileSync('./pages/api/skinslist/Purchaseables.json');
    if (Object.keys(req.query).length === 0) return res.status(200).json(file);
    return res.status(200).send(file);
}