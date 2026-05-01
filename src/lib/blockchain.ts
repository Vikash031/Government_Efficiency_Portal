import { ethers } from 'ethers';
import FIRRegistryABI from '../contracts/FIRRegistryABI.json';

// Configuration
// In production, these should be in .env
// Using Hardhat default account #0 for server-side signing (The "Relayer")
const PRIVATE_KEY = process.env.SERVER_WALLET_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
const RPC_URL = process.env.BLOCKCHAIN_RPC_URL || "http://127.0.0.1:8545";
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Use global to persist across hot reloads in Next.js dev mode
const globalForBlockchain = global as unknown as {
    contract: ethers.Contract | null;
    isOfflineMode: boolean;
};

let contract = globalForBlockchain.contract || null;
let isOfflineMode = globalForBlockchain.isOfflineMode || false;
let provider: ethers.JsonRpcProvider | null = null;
let wallet: ethers.Wallet | null = null;

// Simple helper to check if RPC is reachable
const checkRpc = async () => {
    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 }),
            signal: AbortSignal.timeout(1000) // 1 second timeout
        });
        return response.ok;
    } catch {
        return false;
    }
};

const init = () => {
    if (isOfflineMode) return null;
    
    if (!contract && !isOfflineMode) {
        try {
            provider = new ethers.JsonRpcProvider(RPC_URL, undefined, { 
                staticNetwork: true as any,
            });
            wallet = new ethers.Wallet(PRIVATE_KEY, provider);
            contract = new ethers.Contract(CONTRACT_ADDRESS, FIRRegistryABI, wallet);
            
            // Persist to global
            globalForBlockchain.contract = contract;
        } catch (error) {
            isOfflineMode = true;
            globalForBlockchain.isOfflineMode = true;
            return null;
        }
    }
    return contract;
};

// Modified wrappers to be more silent
export const getAllFIRs = async () => {
    if (isOfflineMode) return [];
    
    // Perform a quick check if this is the first real call
    if (!contract) {
        const isUp = await checkRpc();
        if (!isUp) {
            isOfflineMode = true;
            globalForBlockchain.isOfflineMode = true;
            console.log("ℹ️ Blockchain node offline. Operating in Mock Mode.");
            return [];
        }
    }

    const c = init();
    if (!c) return [];
    try {
        const firs = await c.getAllFIRs();
        // Serializable format
        return firs.map((f: any) => ({
            id: f.id.toString(),
            description: f.description,
            reporter: f.reporter,
            status: f.status,
            timestamp: new Date(Number(f.timestamp) * 1000).toISOString(), // ISO for API
            resolutionNotes: f.resolutionNotes
        }));
    } catch (error) {
        console.error("Error getting FIRs:", error);
        return [];
    }
};

export const createFIR = async (description: string) => {
    const c = init();
    if (!c) throw new Error("Blockchain not connected");
    try {
        const tx = await c.createFIR(description);
        await tx.wait(); // Wait for mining
        return { hash: tx.hash };
    } catch (error) {
        console.error("Error creating FIR:", error);
        throw error;
    }
};

export const updateFIRStatus = async (id: number, status: string, notes: string) => {
    const c = init();
    if (!c) throw new Error("Blockchain not connected");
    try {
        const tx = await c.updateStatus(id, status, notes);
        await tx.wait();
        return { hash: tx.hash };
    } catch (error) {
        console.error("Error updating FIR:", error);
        throw error;
    }
};
