import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { addresses } = req.query;
    const apiKey = process.env.COINMARKETCAP_API_KEY;

    if (!addresses) {
        return res.status(400).json({ error: 'Token addresses are required.' });
    }

    const url = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?address=${addresses}`;
    const options = {
        method: 'GET',
        headers: { 'X-CMC_PRO_API_KEY': apiKey, 'Accept': 'application/json' }
    };

    try {
        const cmcRes = await fetch(url, options);
        const data = await cmcRes.json();
        
        // --- NEW DEBUGGING LOG ---
        console.log("Response from CoinMarketCap:", JSON.stringify(data, null, 2));

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in prices API:", error);
        res.status(500).json({ error: 'Failed to fetch prices.' });
    }
}
