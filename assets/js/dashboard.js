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
    const displayStrategies = (strategies) => {
        const emptyStateHTML = `
            <div class="empty-state">
                <p>Your automated strategies will appear here.</p>
                <button class="cta-button" id="open-modal-btn">+ Create New Strategy</button>
            </div>`;

        const strategyGridHTML = (strategies.map(strategy => `
            <div class="card strategy-card">
                <div class="strategy-card-header">
                    <span class="strategy-type">${strategy.strategy_type.replace('_', ' ')}</span>
                    <span class="status ${strategy.is_active ? 'active' : ''}">${strategy.is_active ? 'Active' : 'Paused'}</span>
                </div>
                <div class="strategy-card-body">Spending ${strategy.amount_in} USDC every week to buy WETH.</div>
                <div class="strategy-card-footer">
                    <button class="card-button">Details</button>
                    <button class="card-button pause">Pause</button>
                </div>
            </div>`
        ).join(''));

        strategiesSection.innerHTML = `
            <h2 class="section-title">Active Strategies</h2>
            ${(!strategies || strategies.length === 0) ? emptyStateHTML : `<div class="strategy-grid">${strategyGridHTML}</div>`}
        `;

        // Re-bind the button after the HTML is updated
        bindOpenModalButton();
    };

    const fetchStrategies = async () => { /* ... same as before ... */ };
    
    const bindOpenModalButton = () => {
        const openModalBtn = document.getElementById('open-modal-btn');
        if (openModalBtn) {
            if (userProxyAddress && userProxyAddress !== ethers.constants.AddressZero) {
                openModalBtn.textContent = "+ Create New Strategy";
                openModalBtn.onclick = () => modal.classList.remove('hidden');
            } else {
                openModalBtn.textContent = "Create Your Strato Wallet";
                openModalBtn.onclick = createProxyWallet;
            }
        }
    };
    
    const createProxyWallet = async () => { /* ... same as before ... */ };
    const handleActivateStrategy = async (event) => { /* ... same as before ... */ };

    async function init() {
        if (typeof window.ethereum === 'undefined') { return alert("MetaMask is not installed."); }
        try {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            const network = await provider.getNetwork();
            if (network.chainId !== BASE_SEPOLIA_CHAIN_ID) {
                return document.body.innerHTML = `<h1 style="color:white; text-align:center;">Please switch to Base Sepolia and refresh.</h1>`;
            }
            signer = provider.getSigner();
            userAddress = await signer.getAddress();
            if (!factoryAddress || factoryAddress === "0xc342129C33b1090091B21c022e59b071937D51Ae") throw new Error("Factory address is not set.");
            
            factoryContract = new ethers.Contract(factoryAddress, factoryABI, signer);
            userProxyAddress = await factoryContract.wallets(userAddress);

            await fetchStrategies();
            
            closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));
            modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.add('hidden'); });
            activateStrategyBtn.addEventListener('click', handleActivateStrategy);
        } catch (error) {
            console.error("Critical initialization error:", error);
            document.body.innerHTML = `<h1 style="color:red; text-align:center;">Error: ${error.message}</h1>`;
        }
    }
    
    init();
});
