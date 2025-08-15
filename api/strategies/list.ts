import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'GET') {
        return res.status(405).end('Method Not Allowed');
    }

    const { owner_address } = req.query;

    if (!owner_address || typeof owner_address !== 'string') {
        return res.status(400).json({ error: 'owner_address is required.' });
    }

    try {
        const { data, error } = await supabase
            .from('strategies')
            .select('*')
            .eq('owner_address', owner_address)
            .order('created_at', { ascending: false });

        if (error) throw error;

        res.status(200).json(data);

    } catch (error) {
        console.error("Error fetching strategies:", error);
        res.status(500).json({ error: 'Failed to fetch strategies.' });
    }
}
