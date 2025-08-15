document.addEventListener('DOMContentLoaded', () => {
    // --- Element Selections ---
    const strategiesSection = document.querySelector('.strategies-section');
    const modal = document.getElementById('strategy-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const activateStrategyBtn = document.querySelector('.modal-action-btn');

    // --- Contract & Config Information ---
    const factoryAddress = "0xc342129C33b1090091B21c022e59b071937D51Ae";
    const factoryABI = [
        {"inputs":[],"name":"createProxyWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    ];
    const BASE_SEPOLIA_CHAIN_ID = 84532;

    let provider, signer, factoryContract, userAddress, userProxyAddress;

    // --- Main Functions ---
    const displayStrategies = (strategies) => { /* ... Function code ... */ };
    const fetchStrategies = async () => { /* ... Function code ... */ };
    
    const checkUserProxyWallet = async () => {
        const openModalBtn = strategiesSection.querySelector('.cta-button');
        console.log("Checking for Strato Wallet...");
        userProxyAddress = await factoryContract.wallets(userAddress);

        if (userProxyAddress && userProxyAddress !== ethers.constants.AddressZero) {
            console.log("Strato Wallet found at:", userProxyAddress);
            openModalBtn.textContent = "+ Create New Strategy";
            openModalBtn.onclick = () => modal.classList.remove('hidden');
        } else {
            console.log("No Strato Wallet found for this user.");
            openModalBtn.textContent = "Create Your Strato Wallet";
            openModalBtn.onclick = createProxyWallet;
        }
    };
    
    // THIS FUNCTION WAS MISSING
    const createProxyWallet = async () => {
        const createBtn = strategiesSection.querySelector('.cta-button');
        createBtn.textContent = "Creating... (Check Wallet)";
        createBtn.disabled = true;
        try {
            const tx = await factoryContract.createProxyWallet();
            console.log("Transaction sent:", tx.hash);
            await tx.wait(); // Wait for transaction to be mined
            alert("Your Strato Smart Wallet created successfully!");
            await init(); // Re-initialize the dashboard to update state
        } catch (error) {
            console.error("Error creating Strato Wallet:", error);
            alert("Failed to create Strato Wallet. See console for details.");
            createBtn.textContent = "Create Your Strato Wallet";
        } finally {
            createBtn.disabled = false;
        }
    };

    const handleActivateStrategy = async (event) => { /* ... Function code ... */ };

    async function init() {
        // ... (The rest of the init function remains the same) ...
    }
    
    // --- Event Listeners ---
    // ... (Event listeners remain the same) ...

    init();
});
