import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { address } = req.query;
    const apiKey = process.env.ALCHEMY_API_KEY;

    if (!address) {
        return res.status(400).json({ error: 'Wallet address is required.' });
    }

    const url = `https://base-mainnet.g.alchemy.com/v2/${apiKey}`;
    const options = {
        method: 'POST',
        headers: {accept: 'application/json', 'content-type': 'application/json'},
        body: JSON.stringify({
            id: 1,
            jsonrpc: '2.0',
            method: 'alchemy_getTokenBalances',
            params: [`${address}`]
        })
    };

    try {
        const alchemyRes = await fetch(url, options);
        const data = await alchemyRes.json();
        res.status(200).json(data.result);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch token balances.' });
    }
}
