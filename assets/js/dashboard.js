document.addEventListener('DOMContentLoaded', async () => {
    // --- Element Selections ---
    const openModalBtn = document.getElementById('open-modal-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modal = document.getElementById('strategy-modal');
    const activateStrategyBtn = document.querySelector('.modal-action-btn');

    // --- Contract Information ---
    const factoryAddress = "0xc342129C33b1090091B21c022e59b071937D51Ae";
    const factoryABI = [
        {"inputs":[],"name":"createProxyWallet","outputs":[],"stateMutability":"nonpayable","type":"function"},
        {"inputs":[{"internalType":"address","name":"","type":"address"}],"name":"wallets","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}
    ];

    let provider, signer, factoryContract, userAddress, userProxyAddress;

    // --- Initialization ---
    async function init() {
        if (typeof window.ethereum === 'undefined') {
            alert("MetaMask is not installed.");
            return window.location.href = '/';
        }
        
        provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                userAddress = accounts[0];
                factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);
                await checkUserProxyWallet();
                await fetchStrategies();
            } else {
                window.location.href = '/';
            }
        } catch (error) {
            console.error("Initialization error:", error);
            window.location.href = '/';
        }
    }

    // --- Main Functions ---
    // ... (All other functions: displayStrategies, fetchStrategies, checkUserProxyWallet, createProxyWallet, handleActivateStrategy) ...
    
    // Make sure all functions are here, and the file ends with this:
    
    // --- Event Listeners ---
    closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
    modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.add('hidden');
    });
    activateStrategyBtn.addEventListener('click', handleActivateStrategy);

    init();
});
