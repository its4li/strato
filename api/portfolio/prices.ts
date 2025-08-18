import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Expecting a comma-separated list of contract addresses
    const { addresses } = req.query;

    if (!addresses || typeof addresses !== 'string') {
        return res.status(400).json({ error: 'Token addresses are required.' });
    }

    // CoinGecko API for Base Mainnet
    const url = `https://api.coingecko.com/api/v3/simple/token_price/base?contract_addresses=${addresses}&vs_currencies=usd`;
    
    const options = {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    };

    try {
        const coingeckoRes = await fetch(url, options);
        const data = await coingeckoRes.json();
        
        console.log("Response from CoinGecko:", JSON.stringify(data, null, 2));

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in prices API:", error);
        res.status(500).json({ error: 'Failed to fetch prices.' });
    }
}
