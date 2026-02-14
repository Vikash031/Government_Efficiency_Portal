import { ethers } from 'ethers';
import FIRRegistryABI from '../contracts/FIRRegistryABI.json';

// Configuration
// In a real app, this would be an environment variable.
// For this demo, we can use a hardcoded address if deployed, or just instructions.
// Since we can't deploy easily here, we will simulate the behavior or ask user to deploy.
// HOWEVER, to make the UI work, we need a valid contract object.
// We will assume the user has a local Hardhat node or a testnet deployment.
// If not, we can default to a placeholder address and catch errors.
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Localhost default

export const getEthereumObject = () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
        return (window as any).ethereum;
    }
    return null;
};

export const setupWeb3 = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) {
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, FIRRegistryABI, signer);

        return { provider, signer, contract };
    } catch (error) {
        console.error("Error setting up Web3:", error);
        return null;
    }
};

export const connectWallet = async () => {
    const ethereum = getEthereumObject();
    if (!ethereum) {
        alert("Please install MetaMask!");
        return null;
    }

    try {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        return accounts[0];
    } catch (error) {
        console.error("Error connecting wallet:", error);
        return null;
    }
};
