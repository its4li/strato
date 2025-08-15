import { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../../lib/supabase'; // Import our Supabase client

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).end('Method Not Allowed');
    }

    try {
        // Get the strategy data from the request body sent by the frontend
        const {
            owner_address,
            proxy_address,
            token_in_address,
            token_out_address,
            amount_in,
            frequency_hours,
        } = req.body;

        // Basic validation (you can add more here)
        if (!owner_address || !amount_in) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Insert the new strategy into our 'strategies' table in Supabase
        const { data, error } = await supabase
            .from('strategies')
            .insert([
                {
                    owner_address,
                    proxy_address,
                    strategy_type: 'DCA_V1', // Hardcoded for our first strategy
                    token_in_address,
                    token_out_address,
                    amount_in,
                    frequency_hours,
                    is_active: true,
                    last_executed_at: new Date().toISOString(), // Set initial execution time
                },
            ])
            .select();

        if (error) {
            throw error;
        }

        // Send a success response back to the frontend
        res.status(201).json({ message: 'Strategy created successfully!', strategy: data });

    } catch (error) {
        console.error("Error creating strategy:", error);
        res.status(500).json({ error: 'Failed to create strategy.' });
    }
}
