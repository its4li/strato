import { VercelRequest, VercelResponse } from '@vercel/node';
import { ethers } from 'ethers';
import { supabase } from '../../lib/supabase'; // اتصال به Supabase

// --- Configuration (from Environment Variables) ---
const KEEPER_PRIVATE_KEY = process.env.KEEPER_PRIVATE_KEY!;
const BASE_RPC_URL = process.env.BASE_RPC_URL!;
const DCA_STRATEGY_CONTRACT_ADDRESS = process.env.DCA_STRATEGY_CONTRACT_ADDRESS!;
const DCA_STRATEGY_ABI = [ /* ABI of DcaStrategy.sol */ ]; // ABI قرارداد را اینجا قرار دهید

// --- The Main Handler Function ---
export default async function handler(req: VercelRequest, res: VercelResponse) {
    console.log("Keeper job started...");

    try {
        // --- 1. Fetch Due Strategies from Supabase ---
        const { data: dueStrategies, error } = await supabase
            .from('strategies')
            .select('*')
            .eq('is_active', true)
            .lte('last_executed_at', new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString());

        if (error) throw error;

        if (!dueStrategies || dueStrategies.length === 0) {
            return res.status(200).json({ message: "No due strategies to execute." });
        }

        // ... (بقیه کد بدون تغییر باقی می‌ماند) ...

    } catch (err) {
        console.error("An error occurred in the keeper job:", err);
        res.status(500).json({ error: "Keeper job failed." });
    }
}
